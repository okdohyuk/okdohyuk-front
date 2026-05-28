'use client';

import React from 'react';
import { Download, FileText, CheckCircle2, XCircle, Loader2, Clock, X } from 'lucide-react';
import { cn } from '@utils/cn';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import type { CopykillerJobStatus, CopykillerJobView } from './types';
import { COPYKILLER_RUNNING_STATUSES } from './types';

// ──────────────────────────────────────────────
// 상태 뱃지 스타일 맵
// ──────────────────────────────────────────────
type BadgeVariant = 'success' | 'danger' | 'warn' | 'neutral' | 'running';

function getStatusBadgeVariant(status: CopykillerJobStatus): BadgeVariant {
  if (status === 'COMPLETED') return 'success';
  if (status === 'FAILED') return 'danger';
  if (status === 'CANCELED') return 'neutral';
  if (COPYKILLER_RUNNING_STATUSES.has(status)) return 'running';
  return 'warn'; // QUEUED
}

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-success-4/60 text-success-2',
  danger: 'bg-danger-4/60 text-danger-2',
  warn: 'bg-warn-4/60 text-warn-2',
  neutral: 'bg-neutral-4/60 text-neutral-2',
  running: 'bg-point-4/60 text-point-fg',
};

function StatusBadge({ status, label }: { status: CopykillerJobStatus; label: string }) {
  const variant = getStatusBadgeVariant(status);
  const isRunning = variant === 'running';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
        BADGE_CLASSES[variant],
      )}
    >
      {isRunning && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
      {status === 'COMPLETED' && <CheckCircle2 className="h-3 w-3" aria-hidden="true" />}
      {status === 'FAILED' && <XCircle className="h-3 w-3" aria-hidden="true" />}
      {status === 'CANCELED' && <X className="h-3 w-3" aria-hidden="true" />}
      {status === 'QUEUED' && <Clock className="h-3 w-3" aria-hidden="true" />}
      {label}
    </span>
  );
}

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────
export interface JobHistoryListProps {
  jobs: CopykillerJobView[];
  onDownload: (jobId: string) => void;
  /** i18n 텍스트 오버라이드 */
  labels: Partial<{
    title: string;
    empty: string;
    downloadCta: string;
    createdAt: string;
    statusQueued: string;
    statusRegistering: string;
    statusChecking: string;
    statusExtracting: string;
    statusRewriting: string;
    statusRechecking: string;
    statusCompleted: string;
    statusFailed: string;
    statusCanceled: string;
    [key: string]: string | undefined;
  }>;
  /** 날짜 포맷 locale */
  locale: string;
}

// ──────────────────────────────────────────────
// 컴포넌트
// ──────────────────────────────────────────────
function JobHistoryList({ jobs, onDownload, labels, locale }: JobHistoryListProps) {
  const t = (key: string, fallback: string) =>
    (labels as Record<string, string | undefined>)[key] ?? fallback;

  const getStatusLabel = (status: CopykillerJobStatus) => {
    const keyMap: Record<CopykillerJobStatus, string> = {
      QUEUED: 'statusQueued',
      REGISTERING: 'statusRegistering',
      CHECKING: 'statusChecking',
      EXTRACTING: 'statusExtracting',
      REWRITING: 'statusRewriting',
      RECHECKING: 'statusRechecking',
      COMPLETED: 'statusCompleted',
      FAILED: 'statusFailed',
      CANCELED: 'statusCanceled',
    };
    return t(keyMap[status], status);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(locale);
    } catch {
      return iso;
    }
  };

  return (
    <section aria-label={t('title', 'copykiller.history.title')}>
      {jobs.length === 0 ? (
        <div
          className={cn(
            SERVICE_PANEL_SOFT,
            'flex flex-col items-center gap-3 px-6 py-10 text-center',
          )}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-basic-2 text-fg-5"
            aria-hidden="true"
          >
            <FileText className="h-7 w-7" />
          </div>
          <p className="text-sm text-fg-4">{t('empty', 'copykiller.history.empty')}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {jobs.map((job) => {
            const canDownload = job.status === 'COMPLETED' && job.resultAvailable;
            return (
              <li
                key={job.id}
                className={cn(
                  SERVICE_PANEL_SOFT,
                  'flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-4',
                )}
              >
                {/* 파일 아이콘 */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-point-4/50 text-point-fg"
                  aria-hidden="true"
                >
                  <FileText className="h-5 w-5" />
                </div>

                {/* 메타 정보 */}
                <div className="min-w-0 flex-1 space-y-1">
                  <p
                    className="truncate text-sm font-semibold text-fg-1"
                    title={job.originalFilename}
                  >
                    {job.originalFilename}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={job.status} label={getStatusLabel(job.status)} />
                    {job.plagPercent !== null && (
                      <span className="text-xs text-fg-5">표절 {job.plagPercent}%</span>
                    )}
                    {job.aiPercent !== null && (
                      <span className="text-xs text-fg-5">AI {job.aiPercent}%</span>
                    )}
                    <time dateTime={job.createdAt} className="text-xs text-fg-5">
                      {formatDate(job.createdAt)}
                    </time>
                  </div>
                </div>

                {/* 다운로드 버튼 */}
                {canDownload ? (
                  <Button
                    type="button"
                    onClick={() => onDownload(job.id)}
                    analyticsKey="copykiller_history_download"
                    className="shrink-0 gap-1.5 text-sm"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    {t('download', '다운로드')}
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default JobHistoryList;
