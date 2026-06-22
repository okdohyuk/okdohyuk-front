'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@components/basic/Button';
import GoogleAd from '@components/google/GoogleAd';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/basic/Table';
import { useMyAttempts, SOLVE_ATTEMPTS_PAGE_SIZE } from '@queries/useSolveQueries';
import { cn } from '@utils/cn';
import type { SolveAttempt } from '@api/Solve';
import { SolveAttemptStatus, SolveAttemptMode } from '@api/Solve';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

type SolveAttemptsClientProps = {
  lng: Language;
};

export default function SolveAttemptsClient({ lng }: SolveAttemptsClientProps) {
  const { t } = useTranslation(lng, 'solve');
  const router = useRouter();
  const [page, setPage] = React.useState(0);

  const { data, isLoading, isError } = useMyAttempts(page, SOLVE_ATTEMPTS_PAGE_SIZE);

  const formatDateTime = (value: string | null | undefined) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString(lng);
  };

  // 이어풀기/결과 보기 진입.
  // 진행 중: quiz 로 진입(서버가 in_progress 재사용). review 면 mode=review + sourceAttemptId 동봉.
  const openAttempt = (attempt: SolveAttempt) => {
    const base = `/${lng}/solve/${attempt.subjectSlug}/quiz`;
    const params = new URLSearchParams();
    if (attempt.unitKey) params.set('unitId', attempt.unitKey);
    if (attempt.mode === SolveAttemptMode.Review) {
      params.set('mode', 'review');
      // review in_progress 는 dedup 키로 재사용된다(sourceAttemptId 는 재사용 시 무시됨).
      params.set('sourceAttemptId', String(attempt.id));
    }
    const qs = params.toString();
    router.push(qs ? `${base}?${qs}` : base);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8 text-fg-4">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-2xl border border-basic-3 bg-basic-0 p-4 text-sm text-danger-1">
        {t('me.error')}
      </p>
    );
  }

  const items = data?.results ?? [];

  if (items.length === 0) {
    return (
      <div className="space-y-3">
        <p className="rounded-2xl border border-basic-3 bg-basic-0 p-4 text-sm text-fg-4">
          {t('me.empty')}
        </p>
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => router.push(`/${lng}/solve`)}
            className="min-h-[40px] rounded-xl px-5"
          >
            {t('me.startSolving')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('me.table.subject')}</TableHead>
            <TableHead>{t('me.table.unit')}</TableHead>
            <TableHead className="w-[80px]">{t('me.table.mode')}</TableHead>
            <TableHead className="w-[90px]">{t('me.table.status')}</TableHead>
            <TableHead className="w-[90px] text-right">{t('me.table.score')}</TableHead>
            <TableHead className="w-[160px]">{t('me.table.startedAt')}</TableHead>
            <TableHead className="w-[110px]">{t('me.table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((attempt) => {
            const inProgress = attempt.status === SolveAttemptStatus.InProgress;
            return (
              <TableRow key={attempt.id}>
                <TableCell className="text-xs text-fg-2">{attempt.subjectSlug}</TableCell>
                <TableCell className="text-xs text-fg-4">
                  {attempt.unitKey ?? t('me.allUnits')}
                </TableCell>
                <TableCell className="text-xs text-fg-4">
                  {attempt.mode === SolveAttemptMode.Review
                    ? t('me.mode.review')
                    : t('me.mode.full')}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold',
                      inProgress ? 'bg-point-soft text-point-1' : 'bg-success-4 text-success-1',
                    )}
                  >
                    {inProgress ? t('me.status.in_progress') : t('me.status.completed')}
                  </span>
                </TableCell>
                <TableCell className="text-right text-xs tabular-nums text-fg-3">
                  {attempt.correctCount} / {attempt.total}
                </TableCell>
                <TableCell className="text-xs text-fg-4">
                  {formatDateTime(attempt.startedAt)}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    onClick={() => openAttempt(attempt)}
                    className="min-h-[28px] rounded-md px-2 text-xs"
                  >
                    {inProgress ? t('me.resume') : t('me.viewResult')}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* 페이지네이션 */}
      {data && (data.count > items.length || page > 0) && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={data.isFirst}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-fg-4 disabled:opacity-40 hover:text-point-fg"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs tabular-nums text-fg-5">{page + 1}</span>
          <button
            type="button"
            disabled={data.isLast}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-fg-4 disabled:opacity-40 hover:text-point-fg"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* in-content 광고: 기록 목록 아래. 액션 버튼과 분리돼 정책상 안전. */}
      <GoogleAd className="mt-2 w-full min-h-16" slotId="6290029027" />
    </div>
  );
}
