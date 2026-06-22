'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import Skeleton from '@components/basic/Skeleton';
import { Text } from '@components/basic/Text';
import GoogleAd from '@components/google/GoogleAd';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import {
  SERVICE_PANEL_SOFT,
  SERVICE_CARD_INTERACTIVE,
} from '@components/complex/Service/interactiveStyles';
import { useSubjectDetail } from '@queries/useSolveQueries';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

type SolveUnitsClientProps = {
  lng: Language;
  slug: string;
};

export default function SolveUnitsClient({ lng, slug }: SolveUnitsClientProps) {
  const { t } = useTranslation(lng, 'solve');
  const router = useRouter();

  const { data: subject, isLoading, isError } = useSubjectDetail(slug);

  // 전체 풀기: unitId 없이 quiz 진입. 단원별: unitId(=unitKey) 쿼리.
  const startQuiz = (unitId?: string) => {
    const base = `/${lng}/solve/${slug}/quiz`;
    router.push(unitId ? `${base}?unitId=${encodeURIComponent(unitId)}` : base);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>
    );
  }

  if (isError || !subject) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => router.push(`/${lng}/solve`)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-fg-4 hover:text-point-fg"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('subject.back')}
        </button>
        <p className="rounded-2xl border border-basic-3 bg-basic-0 p-4 text-sm text-danger-1">
          {isError ? t('subject.error') : t('subject.notFound')}
        </p>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => router.push(`/${lng}/solve`)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-fg-4 hover:text-point-fg"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('subject.back')}
      </button>

      <ServicePageHeader title={subject.title} badge={t('subject.selectUnit')} />

      {/* 전체 풀기 */}
      <button
        type="button"
        onClick={() => startQuiz()}
        className={cn(
          SERVICE_PANEL_SOFT,
          SERVICE_CARD_INTERACTIVE,
          'flex w-full items-center justify-between gap-3 p-4 text-left',
          'border-point-1 bg-point-soft',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-point-1 focus-visible:ring-offset-2 focus-visible:ring-offset-basic-0',
        )}
      >
        <div className="min-w-0">
          <Text variant="t3" color="basic-1" className="leading-tight">
            {t('subject.solveAll')}
          </Text>
          <Text variant="d3" color="basic-5" className="mt-0.5 block">
            {t('subject.solveAllDesc')}
          </Text>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-point-fg" aria-hidden="true" />
      </button>

      {/* 단원별 풀기 */}
      <div className="space-y-2">
        {subject.units.map((unit) => (
          <button
            key={unit.unitKey}
            type="button"
            onClick={() => startQuiz(unit.unitKey)}
            className={cn(
              SERVICE_PANEL_SOFT,
              SERVICE_CARD_INTERACTIVE,
              'flex w-full items-center justify-between gap-3 p-4 text-left',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-point-1 focus-visible:ring-offset-2 focus-visible:ring-offset-basic-0',
            )}
          >
            <div className="min-w-0">
              <Text variant="d2" color="basic-1" className="break-keep leading-snug">
                {unit.name}
              </Text>
              <Text variant="c1" color="basic-5" className="mt-0.5 block tabular-nums">
                {t('subject.unitQuestionCount', { count: unit.questionCount })}
              </Text>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-fg-5" aria-hidden="true" />
          </button>
        ))}
      </div>

      {/* in-content 광고: 단원 목록 아래. 풀이 시작 버튼과 분리된 영역이라 정책상 안전. */}
      <GoogleAd className="mt-4 w-full min-h-16" slotId="6290029027" />
    </>
  );
}
