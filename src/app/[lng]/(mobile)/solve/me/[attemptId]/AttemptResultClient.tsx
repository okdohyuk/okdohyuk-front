'use client';

import React from 'react';
import { Loader2, ArrowLeft, Play } from 'lucide-react';
import { Text } from '@components/basic/Text';
import { Button } from '@components/basic/Button';
import {
  useResumeAttempt,
  useAttemptResult,
  useQuestions,
  SOLVE_QUESTIONS_PAGE_SIZE,
} from '@queries/useSolveQueries';
import { useDepthNavigation } from '@hooks/useDepthNavigation';
import type { SolveQuestion, SolveSubmissionResult } from '@api/Solve';
import { SolveAttemptStatus, SolveAttemptMode } from '@api/Solve';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import SolveResultView from '../../[slug]/quiz/SolveResultView';

type AttemptResultClientProps = {
  lng: Language;
  attemptId: number;
};

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col items-center justify-center gap-3 py-16">{children}</div>;
}

/**
 * 기록의 "결과 보기" 전용 읽기 화면.
 *
 * 예전에는 완료된 시도도 quiz(full) 로 다시 들여보내 새 in_progress 시도가 만들어졌고,
 * 사용자에게는 "기록이 초기화된 것"처럼 보였다. 이 화면은 시도를 새로 만들지 않는다:
 * - 결과 집계는 finish 재호출(완료 시도에 멱등)로 읽어온다.
 * - 오답 모아보기는 attempt detail 의 채점 결과 + 공개 문항 본문으로 구성한다.
 * - "오답 다시 풀기"(review)나 "처음부터 다시 풀기"(새 시도)를 눌렀을 때만 풀이가 시작된다.
 */
export default function AttemptResultClient({ lng, attemptId }: AttemptResultClientProps) {
  const { t } = useTranslation(lng, 'solve');
  const { pushDeeper, goBack } = useDepthNavigation();

  const { data: detail, isLoading, isError } = useResumeAttempt(attemptId);
  const attempt = detail?.attempt;
  const completed = attempt?.status === SolveAttemptStatus.Completed;

  // 결과 집계 — 완료된 시도에만(미완료 시도에 finish 를 쏘면 진짜로 완료돼 버린다).
  const { data: result, isError: resultError } = useAttemptResult(attemptId, completed);

  // 오답 모아보기용 문항 본문 로드: 시도 범위(과목/단원)의 공개 문항을 마지막 페이지까지
  // 누적한다(QuizClient review 모드와 동일 패턴). 오답이 없으면 아예 요청하지 않는다.
  const hasWrong = (result?.wrongQuestionIds.length ?? 0) > 0;
  const [page, setPage] = React.useState(0);
  const [loadedQuestions, setLoadedQuestions] = React.useState<SolveQuestion[]>([]);
  const { data: questionPage } = useQuestions(
    attempt?.subjectSlug ?? '',
    attempt?.unitKey ?? undefined,
    page,
    SOLVE_QUESTIONS_PAGE_SIZE,
    completed && hasWrong && !!attempt,
  );

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
    // 빈 페이지는 방어적으로 종료(QuizClient 와 동일한 폭주 가드).
    if (!questionPage.isLast && questionPage.results.length > 0) {
      setPage((p) => p + 1);
    }
  }, [questionPage]);

  // 채점 결과(정답/해설) 맵 — attempt detail 의 재채점 결과 사용.
  const resultsById = React.useMemo(() => {
    const map = new Map<number, SolveSubmissionResult>();
    (detail?.submissions ?? []).forEach((s) => map.set(s.questionId, s));
    return map;
  }, [detail]);

  const exit = () => goBack(`/${lng}/solve/me`);

  if (isLoading) {
    return (
      <Centered>
        <Loader2 className="h-6 w-6 animate-spin text-fg-4" />
        <Text variant="d3" color="basic-5">
          {t('me.result.loading')}
        </Text>
      </Centered>
    );
  }

  if (isError || !attempt || resultError) {
    return (
      <Centered>
        <p className="rounded-2xl border border-basic-3 bg-basic-0 p-4 text-center text-sm text-danger-1">
          {t('me.result.error')}
        </p>
        <button
          type="button"
          onClick={exit}
          className="inline-flex items-center gap-1 text-xs font-semibold text-fg-4 hover:text-point-fg"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('me.result.back')}
        </button>
      </Centered>
    );
  }

  // 진행 중 시도: 결과가 없으므로 이어풀기만 안내한다(여기서 finish 를 만들지 않는다).
  if (!completed) {
    const params = new URLSearchParams();
    if (attempt.unitKey) params.set('unitId', attempt.unitKey);
    if (attempt.mode === SolveAttemptMode.Review) {
      params.set('mode', 'review');
      params.set('sourceAttemptId', String(attempt.id));
    }
    const qs = params.toString();
    const quizHref = `/${lng}/solve/${attempt.subjectSlug}/quiz${qs ? `?${qs}` : ''}`;
    return (
      <Centered>
        <p className="rounded-2xl border border-basic-3 bg-basic-0 p-4 text-center text-sm text-fg-3">
          {t('me.result.inProgress')}
        </p>
        <Button
          type="button"
          onClick={() => pushDeeper(quizHref)}
          className="min-h-[44px] rounded-xl px-6"
        >
          <Play className="mr-2 h-4 w-4" />
          {t('me.resume')}
        </Button>
        <button
          type="button"
          onClick={exit}
          className="inline-flex items-center gap-1 text-xs font-semibold text-fg-4 hover:text-point-fg"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('me.result.back')}
        </button>
      </Centered>
    );
  }

  if (!result) {
    return (
      <Centered>
        <Loader2 className="h-6 w-6 animate-spin text-fg-4" />
        <Text variant="d3" color="basic-5">
          {t('me.result.loading')}
        </Text>
      </Centered>
    );
  }

  const quizBase = `/${lng}/solve/${attempt.subjectSlug}/quiz`;
  const unitQuery = attempt.unitKey ? `unitId=${encodeURIComponent(attempt.unitKey)}` : '';

  return (
    <SolveResultView
      lng={lng}
      slug={attempt.subjectSlug}
      result={result}
      attemptId={attemptId}
      questions={loadedQuestions}
      resultsByQuestionId={(id) => resultsById.get(id)}
      onExit={exit}
      onRetryWrong={() =>
        pushDeeper(`${quizBase}?mode=review&sourceAttemptId=${encodeURIComponent(attemptId)}`)
      }
      onRetryFull={() => pushDeeper(unitQuery ? `${quizBase}?${unitQuery}` : quizBase)}
    />
  );
}
