/* eslint-disable react/require-default-props */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, ArrowLeft } from 'lucide-react';
import { Text } from '@components/basic/Text';
import { Button } from '@components/basic/Button';
import GoogleAd from '@components/google/GoogleAd';
import { ScoreRing } from '@components/basic/ScoreRing';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';
import type { SolveQuestion, SolveQuizResult, SolveSubmissionResult } from '@api/Solve';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { WrongAnswerList, type WrongAnswerItem } from '../../components';

type SolveResultViewProps = {
  lng: Language;
  slug: string;
  result: SolveQuizResult;
  /** 결과를 만든 시도 PK. 오답 재풀이(review) 진입에 sourceAttemptId 로 사용. */
  attemptId: number;
  /** 오답 모아보기용 — 시도 범위에서 로드된 문항. 없으면 목록 섹션을 생략한다. */
  questions?: SolveQuestion[];
  /** questionId → 채점 결과 조회 함수(로컬 누적/서버 복원 어느 쪽이든). */
  resultsByQuestionId?: (id: number) => SolveSubmissionResult | undefined;
  /** 뒤로(플로우 뎁스 복귀). 미지정 시 과목 목록으로 push. */
  onExit?: () => void;
  /** 오답 다시 풀기 동작 오버라이드(기록 결과 페이지는 push, 풀이 직후는 replace 기본값). */
  onRetryWrong?: () => void;
  /** "처음부터 다시 풀기"(새 시도 시작). 지정된 경우에만 버튼 노출 — 기록 결과 페이지 전용. */
  onRetryFull?: () => void;
};

export default function SolveResultView({
  lng,
  slug,
  result,
  attemptId,
  questions,
  resultsByQuestionId,
  onExit,
  onRetryWrong,
  onRetryFull,
}: SolveResultViewProps) {
  const { t } = useTranslation(lng, 'solve');
  const router = useRouter();

  const hasWrong = result.wrongQuestionIds.length > 0;
  const percent = Math.round(result.ratio * 100);

  const retryWrong = () => {
    // push 대신 replace: review 에서 그만두기(뒤로) 했을 때, 방금 완료된 full 퀴즈 URL 로
    // 되돌아가 의도치 않은 새 시도가 시작되는 것을 막는다(결과 화면은 히스토리에 남을 필요 없음).
    router.replace(
      `/${lng}/solve/${slug}/quiz?mode=review&sourceAttemptId=${encodeURIComponent(attemptId)}`,
    );
  };

  // 오답 모아보기 항목: 서버 오답 id 순서대로, 로드된 문항/채점 결과를 붙인다.
  const wrongItems = React.useMemo<WrongAnswerItem[]>(() => {
    if (!hasWrong || !questions) return [];
    const byId = new Map(questions.map((q) => [q.id, q]));
    return result.wrongQuestionIds
      .map<WrongAnswerItem | null>((id) => {
        const question = byId.get(id);
        if (!question) return null;
        return { question, result: resultsByQuestionId?.(question.id) };
      })
      .filter((item): item is WrongAnswerItem => !!item);
  }, [hasWrong, questions, result.wrongQuestionIds, resultsByQuestionId]);

  return (
    <div className="space-y-5">
      <div className={cn(SERVICE_PANEL_SOFT, 'flex flex-col items-center gap-3 px-5 py-8')}>
        <Text variant="t3" color="basic-1">
          {t('result.title')}
        </Text>
        <ScoreRing correct={result.correct} total={result.total} />
        <Text variant="d2" color="basic-2" className="tabular-nums">
          {t('result.correctOf', { correct: result.correct, total: result.total })}
        </Text>
        <Text variant="d3" color="basic-5" className="tabular-nums">
          {t('result.ratio')} {percent}%
        </Text>
      </div>

      {result.units.length > 0 && (
        <div className="space-y-2">
          <Text variant="d2" color="basic-2" className="font-semibold">
            {t('result.byUnit')}
          </Text>
          <ul className="space-y-2">
            {result.units.map((unit) => (
              <li
                key={unit.unitKey}
                className="flex items-center justify-between gap-3 rounded-2xl border border-basic-3 bg-basic-0 px-4 py-3"
              >
                <Text variant="d3" color="basic-2" className="min-w-0 break-keep">
                  {unit.unitName}
                </Text>
                <Text variant="d3" color="basic-1" className="shrink-0 font-semibold tabular-nums">
                  {unit.correct} / {unit.total}
                </Text>
              </li>
            ))}
          </ul>
        </div>
      )}

      {wrongItems.length > 0 && <WrongAnswerList lng={lng} items={wrongItems} />}

      <div className="flex flex-col gap-2">
        {hasWrong ? (
          <Button
            type="button"
            onClick={onRetryWrong ?? retryWrong}
            className="min-h-[48px] rounded-xl"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {t('result.retryWrong')}
          </Button>
        ) : (
          <p className="rounded-2xl border border-success-2 bg-success-4 px-4 py-3 text-center text-sm font-semibold text-success-1">
            {t('result.noWrong')}
          </p>
        )}
        {onRetryFull && (
          <button
            type="button"
            onClick={onRetryFull}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-basic-3 bg-basic-0 text-sm font-semibold text-fg-3 transition-colors hover:bg-basic-1"
          >
            <RotateCcw className="h-4 w-4" />
            {t('result.retryFull')}
          </button>
        )}
        <button
          type="button"
          onClick={onExit ?? (() => router.push(`/${lng}/solve`))}
          className="inline-flex items-center justify-center gap-1 py-2 text-sm font-semibold text-fg-4 hover:text-point-fg"
        >
          <ArrowLeft className="h-4 w-4" />
          {onExit ? t('result.back') : t('result.backToSubjects')}
        </button>
      </div>

      {/* in-content 광고: 결과 점수/액션 버튼 아래. 보기·입력과 분리돼 정책상 안전. */}
      <GoogleAd className="mt-2 w-full min-h-16" slotId="6290029027" />
    </div>
  );
}
