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
import type { SolveQuizResult } from '@api/Solve';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

type SolveResultViewProps = {
  lng: Language;
  slug: string;
  result: SolveQuizResult;
  /** 결과를 만든 시도 PK. 오답 재풀이(review) 진입에 sourceAttemptId 로 사용. */
  attemptId: number;
};

export default function SolveResultView({ lng, slug, result, attemptId }: SolveResultViewProps) {
  const { t } = useTranslation(lng, 'solve');
  const router = useRouter();

  const hasWrong = result.wrongQuestionIds.length > 0;
  const percent = Math.round(result.ratio * 100);

  const retryWrong = () => {
    router.push(
      `/${lng}/solve/${slug}/quiz?mode=review&sourceAttemptId=${encodeURIComponent(attemptId)}`,
    );
  };

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

      <div className="flex flex-col gap-2">
        {hasWrong ? (
          <Button type="button" onClick={retryWrong} className="min-h-[48px] rounded-xl">
            <RotateCcw className="mr-2 h-4 w-4" />
            {t('result.retryWrong')}
          </Button>
        ) : (
          <p className="rounded-2xl border border-success-2 bg-success-4 px-4 py-3 text-center text-sm font-semibold text-success-1">
            {t('result.noWrong')}
          </p>
        )}
        <button
          type="button"
          onClick={() => router.push(`/${lng}/solve`)}
          className="inline-flex items-center justify-center gap-1 py-2 text-sm font-semibold text-fg-4 hover:text-point-fg"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('result.backToSubjects')}
        </button>
      </div>

      {/* in-content 광고: 결과 점수/액션 버튼 아래. 보기·입력과 분리돼 정책상 안전. */}
      <GoogleAd className="mt-2 w-full min-h-16" slotId="6290029027" />
    </div>
  );
}
