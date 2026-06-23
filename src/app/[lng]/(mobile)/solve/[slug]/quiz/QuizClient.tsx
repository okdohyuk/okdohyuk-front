/* eslint-disable react/require-default-props */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Text } from '@components/basic/Text';
import { Button } from '@components/basic/Button';
import Skeleton from '@components/basic/Skeleton';
import { CodeBlock } from '@components/basic/CodeBlock';
import { ProgressBar } from '@components/basic/ProgressBar';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';
import logger from '@utils/logger';
import {
  useStartAttempt,
  useResumeAttempt,
  useSubmitAnswer,
  useFinishAttempt,
  useQuestions,
  SOLVE_QUESTIONS_PAGE_SIZE,
} from '@queries/useSolveQueries';
import type {
  SolveAttemptMode,
  SolveQuestion,
  SolveQuizResult,
  SolveSubmissionRequest,
  SolveSubmissionResult,
} from '@api/Solve';
import { SolveQuestionType } from '@api/Solve';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  ChoiceButton,
  ShortAnswerInput,
  ClozeBlock,
  ExplanationPanel,
  type ChoiceIndex,
  type ClozeBlankValue,
} from '../../components';
import SolveResultView from './SolveResultView';

type QuizClientProps = {
  lng: Language;
  slug: string;
  unitId?: string;
  mode: SolveAttemptMode;
  sourceAttemptId?: number;
};

// 채점 후 MCQ 선택지의 시각 상태를 서버 결과로 계산(컴포넌트는 정답을 모름).
function choiceState(
  idx: ChoiceIndex,
  selected: number | undefined,
  result: SolveSubmissionResult | undefined,
): 'default' | 'selected' | 'correct' | 'wrong' | 'dimmed' {
  if (!result) return selected === idx ? 'selected' : 'default';
  if (idx === result.correctChoice) return 'correct';
  if (idx === selected) return 'wrong';
  return 'dimmed';
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col items-center justify-center gap-3 py-16">{children}</div>;
}

function BackButton({
  lng,
  slug,
  label,
  router,
}: {
  lng: Language;
  slug: string;
  label: string;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <button
      type="button"
      onClick={() => router.push(`/${lng}/solve/${slug}`)}
      className="inline-flex items-center gap-1 text-xs font-semibold text-fg-4 hover:text-point-fg"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}

export default function QuizClient({ lng, slug, unitId, mode, sourceAttemptId }: QuizClientProps) {
  const { t } = useTranslation(lng, 'solve');
  const router = useRouter();

  // 1) attempt 시작/재개 — 서버가 in_progress 를 재사용(멱등)하거나 새로 생성한다.
  //    POST 지만 멱등이라 useQuery 로 모델링한다. (mutation 을 useEffect 에서 호출하면
  //    StrictMode 가 클라이언트 네비게이션 시 마운트 effect 를 setup→cleanup→setup 으로
  //    2회 호출하면서 in-flight mutation 이 고아가 돼 observer 가 영구 pending 이 되고,
  //    attempt 가 안 잡혀 "준비 중"에서 멈추는 버그가 있었다. 전체 새로고침=hydration 은
  //    effect 1회라 무사했지만 목록→문제 SPA 이동은 깨졌다. query 는 StrictMode/동시성에
  //    안전하며 결과를 data/error 로 반응형 노출한다.)
  const startAttempt = useStartAttempt({
    subjectSlug: slug,
    unitId: unitId ?? null,
    mode,
    sourceAttemptId: sourceAttemptId ?? null,
  });

  const attempt = startAttempt.data ?? null;
  const attemptId = attempt?.id ?? null;
  // review 모드 오답 0개면 409(SOLVE_REVIEW_NO_WRONG) → "복습할 문제 없음". 그 외는 일반 에러.
  const startStatus = (startAttempt.error as { response?: { status?: number } } | null)?.response
    ?.status;
  const noReview = mode === 'review' && startStatus === 409;
  const startError = startAttempt.isError && !noReview;

  // 2) attempt detail — 이전 제출 결과 복원 + review scope 동결 id.
  const { data: detail } = useResumeAttempt(attemptId);

  // 3) 문항 로드. full=단원/과목 페이지네이션. review=scope 도출.
  //    review scope 는 detail.scopeQuestionIds 로 동결. full 은 unitId(=unitKey) 범위.
  const scopeIds = detail?.scopeQuestionIds ?? undefined;
  const isReview = mode === 'review';

  // 점진 페이지 로딩: 현재 페이지까지 누적. (review 는 scope 다 찾을 때까지, full 은 현재 위치 도달까지)
  const [page, setPage] = React.useState(0);
  const {
    data: questionPage,
    isLoading: questionsLoading,
    isError: questionsError,
  } = useQuestions(slug, unitId, page, SOLVE_QUESTIONS_PAGE_SIZE, attemptId != null);

  const [loadedQuestions, setLoadedQuestions] = React.useState<SolveQuestion[]>([]);
  const [allPagesLoaded, setAllPagesLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!questionPage) return;
    setLoadedQuestions((prev) => {
      const seen = new Set(prev.map((q) => q.id));
      const merged = [...prev];
      questionPage.results.forEach((q) => {
        if (!seen.has(q.id)) merged.push(q);
      });
      return merged;
    });
    // 종료 조건 우선순위: isLast(서버가 명시) → 빈 페이지(서버가 더 줄 게 없음).
    // 빈 페이지(results.length === 0 & isLast=false)는 실 백엔드엔 없는 비정상 응답이지만,
    // 이를 종료로 처리하지 않으면 progressive 로딩이 더 늘지 않는 length 로 setPage 를
    // 무한 증가시켜 폭주한다. 방어적으로 즉시 로딩 종료.
    if (questionPage.isLast || questionPage.results.length === 0) {
      setAllPagesLoaded(true);
    } else if (isReview) {
      // review: scope 전부 확보 전까지 다음 페이지 계속 로드.
      setPage((p) => p + 1);
    }
  }, [questionPage, isReview]);

  // review 면 scope 순서대로, full 이면 로드 순서대로 문항 배열 확정.
  const questions = React.useMemo<SolveQuestion[]>(() => {
    if (isReview && scopeIds && scopeIds.length > 0) {
      const byId = new Map(loadedQuestions.map((q) => [q.id, q]));
      return scopeIds.map((id) => byId.get(id)).filter((q): q is SolveQuestion => !!q);
    }
    return loadedQuestions;
  }, [isReview, scopeIds, loadedQuestions]);

  // 4) 진행 인덱스 — 재개 시 attempt.currentIndex 로 복원.
  const [index, setIndex] = React.useState(0);
  const restoredRef = React.useRef(false);
  React.useEffect(() => {
    if (restoredRef.current || !attempt) return;
    restoredRef.current = true;
    setIndex(Math.max(0, attempt.currentIndex));
  }, [attempt]);

  // 이전 제출 결과 맵(questionId → result) 복원.
  const submittedById = React.useMemo(() => {
    const map = new Map<number, SolveSubmissionResult>();
    (detail?.submissions ?? []).forEach((s) => map.set(s.questionId, s));
    return map;
  }, [detail]);

  // 시도 범위 전체 문항 수(신뢰원). attempt.total 우선, 없으면 페이지 응답 count, 최후 로드 수.
  // review 모드는 attempt.total 이 곧 scope 크기이며 questions.length 와 일치한다.
  const total = attempt?.total ?? questionPage?.count ?? questions.length;

  // full 모드 progressive 로딩: 현재 인덱스가 로드된 페이지의 끝(마지막 문항)에 도달하면
  // 다음 페이지를 미리 가져와 questions 배열에 누적한다. `length`(벗어남)가 아니라
  // `length - 1`(마지막 로드 문항)을 임계로 써서, 마지막 문항에서 "다음"을 누르기 전에
  // 다음 페이지가 채워지도록 한 칸 prefetch 한다(pilgi 1,786 같은 대량 과목 끊김 방지).
  // 상한 가드: 로드 수가 total 에 도달하면 더 요청하지 않는다(setPage 무한 증가 방지).
  // 정상 데이터에서는 length 가 index+1 을 넘는 순간 자연 종료되므로 동작은 동일하고,
  // 비정상(빈/부족 페이지) 응답에서만 추가로 멈춘다.
  React.useEffect(() => {
    if (isReview || allPagesLoaded) return;
    if (
      loadedQuestions.length > 0 &&
      loadedQuestions.length < total &&
      index >= loadedQuestions.length - 1 &&
      questionPage &&
      !questionPage.isLast
    ) {
      setPage((p) => p + 1);
    }
  }, [index, loadedQuestions.length, allPagesLoaded, questionPage, isReview, total]);

  const current = questions[index];
  const currentResult = current ? submittedById.get(current.id) : undefined;

  // 방금 제출한 결과(낙관적 표시). 복원 결과와 합쳐 표시.
  const [justResult, setJustResult] = React.useState<SolveSubmissionResult | null>(null);
  const [justSubmitted, setJustSubmitted] = React.useState<{
    choice?: number;
    text?: string;
    blanks?: ClozeBlankValue[];
  } | null>(null);
  const displayResult = justResult ?? currentResult;

  // 5) 제출
  const submitAnswer = useSubmitAnswer(attemptId ?? 0);
  const submit = (payload: Pick<SolveSubmissionRequest, 'choice' | 'text' | 'blanks'>) => {
    if (!current || attemptId == null || displayResult) return;
    setJustSubmitted({
      choice: payload.choice ?? undefined,
      text: payload.text ?? undefined,
      blanks: (payload.blanks ?? undefined)?.map((b) => ({ blankId: b.blankId, value: b.value })),
    });
    submitAnswer.mutate(
      { questionId: current.id, index, ...payload },
      {
        onSuccess: (data) => setJustResult(data),
        onError: (err) => {
          logger.error('solve 제출 실패', err);
          setJustSubmitted(null);
        },
      },
    );
  };

  const goNext = () => {
    setJustResult(null);
    setJustSubmitted(null);
    setIndex((i) => i + 1);
  };

  // 6) finish + 결과
  const finishAttempt = useFinishAttempt(attemptId ?? 0);
  const [result, setResult] = React.useState<SolveQuizResult | null>(null);
  const finish = () => {
    if (attemptId == null) return;
    finishAttempt.mutate(undefined, {
      onSuccess: (data) => setResult(data),
      onError: (err) => logger.error('solve finish 실패', err),
    });
  };

  // "결과 보기" 노출/마지막 판정은 로드된 문항 수가 아니라 시도 전체 문항 수(total) 기준.
  // full 모드는 페이지네이션으로 일부만 로드돼 있으므로 questions.length 로 판정하면
  // 페이지 경계(예: pilgi index 99/total 1,786)에서 조기 종료가 발생한다.
  // 방어: 모든 페이지를 다 로드했는데도 total 이 실제 로드 수보다 큰 비정상 케이스에서는
  //       도달 불가능한 끝을 기다리지 않도록 실제 로드 수로 클램프한다.
  const effectiveTotal = allPagesLoaded ? Math.min(total, questions.length) : total;
  const isLast = index >= effectiveTotal - 1;
  const graded = !!displayResult;

  // 키보드: 1~4(MCQ 선택+제출), → (다음/결과), ← (이전)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!current || result) return;
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA';
      if (current.type === SolveQuestionType.Mcq && !graded && !typing) {
        const n = Number(e.key);
        if (n >= 1 && n <= 4 && current.choices && n <= current.choices.length) {
          e.preventDefault();
          submit({ choice: n });
          return;
        }
      }
      if (e.key === 'ArrowRight' && graded) {
        e.preventDefault();
        if (isLast) finish();
        else goNext();
      }
      if (e.key === 'ArrowLeft' && index > 0 && !typing) {
        e.preventDefault();
        setJustResult(null);
        setJustSubmitted(null);
        setIndex((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // 핸들러는 현재 문항/채점/위치 변화 시 재바인딩(submit/finish/goNext 는 매 렌더 갱신).
  }, [current, graded, isLast, index, result]);

  // --- 렌더 분기 ---

  if (noReview) {
    return (
      <Centered>
        <p className="rounded-2xl border border-basic-3 bg-basic-0 p-4 text-center text-sm text-fg-3">
          {t('quiz.noReview')}
        </p>
        <BackButton lng={lng} slug={slug} label={t('subject.back')} router={router} />
      </Centered>
    );
  }

  if (startError) {
    return (
      <Centered>
        <p className="rounded-2xl border border-basic-3 bg-basic-0 p-4 text-center text-sm text-danger-1">
          {t('quiz.error')}
        </p>
        <BackButton lng={lng} slug={slug} label={t('subject.back')} router={router} />
      </Centered>
    );
  }

  // 결과 화면
  if (result && attemptId != null) {
    return <SolveResultView lng={lng} slug={slug} result={result} attemptId={attemptId} />;
  }

  // 준비/로딩
  if (attemptId == null || (questionsLoading && loadedQuestions.length === 0)) {
    return (
      <Centered>
        <Loader2 className="h-6 w-6 animate-spin text-fg-4" />
        <Text variant="d3" color="basic-5">
          {t('quiz.preparing')}
        </Text>
      </Centered>
    );
  }

  if (questionsError) {
    return (
      <Centered>
        <p className="rounded-2xl border border-basic-3 bg-basic-0 p-4 text-center text-sm text-danger-1">
          {t('quiz.error')}
        </p>
        <BackButton lng={lng} slug={slug} label={t('subject.back')} router={router} />
      </Centered>
    );
  }

  if (questions.length === 0 && allPagesLoaded) {
    return (
      <Centered>
        <p className="rounded-2xl border border-basic-3 bg-basic-0 p-4 text-center text-sm text-fg-3">
          {t('quiz.empty')}
        </p>
        <BackButton lng={lng} slug={slug} label={t('subject.back')} router={router} />
      </Centered>
    );
  }

  if (!current) {
    // 현재 인덱스 문항이 아직 로드 전.
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-14 rounded-2xl" />
      </div>
    );
  }

  // 복원된 제출값(이전 제출 표시용). 서버 SolveSubmissionResult 는 사용자가 고른 choice 를
  // 포함하지 않으므로, 방금 제출(justSubmitted)이 있을 때만 사용자가 고른 번호를 강조한다.
  const restoredChoice = justSubmitted?.choice;
  const submittedTextValue = justSubmitted?.text;
  const submittedBlankMap = (justSubmitted?.blanks ?? []).reduce<Record<string, string>>(
    (acc, b) => {
      acc[b.blankId] = b.value;
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-4">
      {/* 상단: 진행률 + 그만두기 */}
      <div className="flex items-center gap-3">
        <ProgressBar
          value={total > 0 ? index / total : 0}
          label={t('quiz.questionLabel')}
          className="flex-1"
        />
        <Text variant="c1" color="basic-5" className="shrink-0 font-semibold tabular-nums">
          {t('quiz.progress', { current: index + 1, total })}
        </Text>
      </div>

      {/* 문항 */}
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-5')}>
        {current.no != null && (
          <Text variant="c1" color="basic-5" className="block font-semibold tabular-nums">
            Q{current.no}
          </Text>
        )}
        <Text
          variant="d1"
          color="basic-1"
          className="block whitespace-pre-wrap break-keep font-semibold leading-relaxed"
        >
          {current.question}
        </Text>

        {current.code && current.type !== SolveQuestionType.Cloze && (
          <CodeBlock code={current.code} language={current.codeLanguage ?? undefined} />
        )}

        {/* MCQ */}
        {current.type === SolveQuestionType.Mcq && current.choices && (
          <div className="space-y-2.5">
            {current.choices.map((choice, i) => {
              const idx = (i + 1) as ChoiceIndex;
              const selected = restoredChoice;
              return (
                <ChoiceButton
                  key={`${current.id}-${idx}`}
                  index={idx}
                  text={choice}
                  state={choiceState(idx, selected, displayResult)}
                  locked={graded}
                  onSelect={(n) => submit({ choice: n })}
                />
              );
            })}
          </div>
        )}

        {/* 단답 */}
        {current.type === SolveQuestionType.Short && (
          <ShortAnswerInput
            key={current.id}
            code={!!current.codeLanguage}
            graded={graded}
            isCorrect={displayResult?.isCorrect}
            submittedText={submittedTextValue}
            correctText={displayResult?.correctText ?? undefined}
            onSubmit={(value) => submit({ text: value })}
          />
        )}

        {/* 코드 빈칸 */}
        {current.type === SolveQuestionType.Cloze && current.clozeTemplate && (
          <ClozeBlock
            key={current.id}
            clozeTemplate={current.clozeTemplate}
            codeLanguage={current.codeLanguage ?? undefined}
            graded={graded}
            submittedMap={submittedBlankMap}
            blankResults={displayResult?.blankResults ?? undefined}
            onSubmit={(blanks) => submit({ blanks })}
          />
        )}
      </div>

      {/* 해설 + 다음 */}
      {displayResult && (
        <>
          <ExplanationPanel
            correct={displayResult.isCorrect}
            explanation={displayResult.explanation}
            slides={current.slides ?? undefined}
            trapType={current.trapType ?? undefined}
          />
          <Button
            type="button"
            onClick={() => (isLast ? finish() : goNext())}
            disabled={finishAttempt.isPending}
            className="min-h-[48px] w-full rounded-xl"
          >
            {finishAttempt.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
            {!finishAttempt.isPending && (isLast ? t('quiz.finish') : t('quiz.next'))}
          </Button>
        </>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => router.push(`/${lng}/solve/${slug}`)}
          className="inline-flex items-center gap-1 py-1 text-xs font-semibold text-fg-5 hover:text-point-fg"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('quiz.exit')}
        </button>
      </div>
    </div>
  );
}
