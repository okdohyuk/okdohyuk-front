'use client';

import React from 'react';
import { CheckCircle2, XCircle, Loader2, Download, X, AlertCircle } from 'lucide-react';
import { cn } from '@utils/cn';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import type { CopykillerJobStatus, CopykillerJobView } from './types';
import { COPYKILLER_RUNNING_STATUSES } from './types';

// ──────────────────────────────────────────────
// 상태 단계 정의 (순서대로)
// ──────────────────────────────────────────────
const STATUS_STEPS: ReadonlyArray<CopykillerJobStatus> = [
  'REGISTERING',
  'CHECKING',
  'EXTRACTING',
  'REWRITING',
  'RECHECKING',
  'COMPLETED',
];

type StepState = 'completed' | 'current' | 'pending' | 'failed' | 'canceled';

function getStepState(step: CopykillerJobStatus, currentStatus: CopykillerJobStatus): StepState {
  if (currentStatus === 'FAILED') return 'failed';
  if (currentStatus === 'CANCELED') return 'canceled';

  const stepIdx = STATUS_STEPS.indexOf(step);
  const curIdx = STATUS_STEPS.indexOf(currentStatus);

  if (stepIdx < curIdx) return 'completed';
  if (stepIdx === curIdx) return 'current';
  return 'pending';
}

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────
export interface JobProgressPanelProps {
  job: CopykillerJobView;
  onDownload: (() => void) | undefined;
  onCancel: (() => void) | undefined;
  /** i18n 텍스트 오버라이드 */
  labels: Partial<{
    title: string;
    iteration: string;
    plagPercent: string;
    aiPercent: string;
    downloadCta: string;
    cancelCta: string;
    errorLabel: string;
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
}

// ──────────────────────────────────────────────
// 서브 컴포넌트: ProgressBar
// ──────────────────────────────────────────────
function ProgressBar({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-basic-2"
      role="progressbar"
      aria-label="진행률"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-point-2 transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

// ──────────────────────────────────────────────
// 서브 컴포넌트: StatBadge
// ──────────────────────────────────────────────
function StatBadge({
  label,
  value,
  threshold,
  unit,
}: {
  label: string;
  value: number | null;
  threshold: number;
  unit: string;
}) {
  if (value === null) return null;
  const isOk = value <= threshold;
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-xl px-4 py-2 text-center',
        isOk ? 'bg-success-4/60 text-success-2' : 'bg-warn-4/60 text-warn-2',
      )}
    >
      <span className="text-xs font-medium opacity-80">{label}</span>
      <span className="text-lg font-black tabular-nums">
        {value}
        {unit}
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────────
function JobProgressPanel({ job, onDownload, onCancel, labels }: JobProgressPanelProps) {
  const t = (key: string, fallback: string) =>
    (labels as Record<string, string | undefined>)[key] ?? fallback;

  const isRunning = COPYKILLER_RUNNING_STATUSES.has(job.status);
  const isCompleted = job.status === 'COMPLETED';
  const isFailed = job.status === 'FAILED';
  const isCanceled = job.status === 'CANCELED';
  const isTerminal = isCompleted || isFailed || isCanceled;

  // 진행률 계산 (QUEUED = 0, 이후 단계별 균등)
  const totalSteps = STATUS_STEPS.length;
  const curStepIdx = STATUS_STEPS.indexOf(job.status);
  let progressPct = 0;
  if (isCompleted) {
    progressPct = 100;
  } else if (!isTerminal && curStepIdx >= 0) {
    progressPct = Math.round(((curStepIdx + 1) / totalSteps) * 100);
  }

  return (
    <section
      className={cn(SERVICE_PANEL_SOFT, 'space-y-5 p-5')}
      aria-label={t('title', 'copykiller.progress.title')}
    >
      {/* ── 헤더 ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="truncate text-sm font-bold text-fg-1">{job.originalFilename}</p>
          <p className="text-xs text-fg-5">
            {t('iteration', '{{current}} / {{max}}')
              .replace('{{current}}', String(job.currentIteration))
              .replace('{{max}}', String(job.maxIterations))}
          </p>
        </div>

        {/* 상태 아이콘 */}
        <div aria-label={job.status} className="shrink-0 pt-0.5">
          {isCompleted && <CheckCircle2 className="h-5 w-5 text-success-2" aria-hidden="false" />}
          {isFailed && <XCircle className="h-5 w-5 text-danger-2" aria-hidden="false" />}
          {isCanceled && <X className="h-5 w-5 text-neutral-3" aria-hidden="false" />}
          {isRunning && (
            <Loader2 className="h-5 w-5 animate-spin text-point-fg" aria-hidden="false" />
          )}
        </div>
      </div>

      {/* ── 진행률 바 (QUEUED·진행 중일 때) ── */}
      {(isRunning || job.status === 'QUEUED') && <ProgressBar value={progressPct} />}

      {/* ── 단계 스텝퍼 ── */}
      {!isFailed && !isCanceled && (
        <ol
          className="flex items-center gap-0"
          aria-label={t('title', 'copykiller.progress.steps')}
        >
          {STATUS_STEPS.map((step, idx) => {
            const state = getStepState(step, job.status);
            return (
              <React.Fragment key={step}>
                <li
                  className="flex flex-col items-center gap-1"
                  aria-current={state === 'current' ? 'step' : undefined}
                >
                  <div
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors',
                      state === 'completed' && 'bg-success-2 text-white',
                      state === 'current' && 'bg-point-2 text-white ring-2 ring-point-2/40',
                      state === 'pending' && 'bg-basic-2 text-fg-5',
                    )}
                    aria-hidden="true"
                  >
                    {state === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                  </div>
                  <span
                    className={cn(
                      'hidden text-center text-[10px] leading-tight sm:block',
                      state === 'completed' && 'text-success-2',
                      state === 'current' && 'font-semibold text-point-fg',
                      state === 'pending' && 'text-fg-5',
                    )}
                  >
                    {t(`status${step.charAt(0) + step.slice(1).toLowerCase()}`, step)}
                  </span>
                </li>

                {/* 연결선 */}
                {idx < STATUS_STEPS.length - 1 && (
                  <div
                    className={cn(
                      'mx-0.5 h-px flex-1 transition-colors',
                      STATUS_STEPS.indexOf(step) < STATUS_STEPS.indexOf(job.status)
                        ? 'bg-success-2'
                        : 'bg-basic-2',
                    )}
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            );
          })}
        </ol>
      )}

      {/* ── 수치 뱃지 ── */}
      {(job.plagPercent !== null || job.aiPercent !== null) && (
        <div className="flex gap-3" role="status" aria-live="polite">
          <StatBadge
            label={t('plagPercent', 'copykiller.progress.plagPercent')}
            value={job.plagPercent ?? null}
            threshold={job.targetPlag}
            unit="%"
          />
          <StatBadge
            label={t('aiPercent', 'copykiller.progress.aiPercent')}
            value={job.aiPercent ?? null}
            threshold={job.targetAi}
            unit="%"
          />
        </div>
      )}

      {/* ── 에러 메시지 ── */}
      {isFailed && job.errorMessage ? (
        <div
          className="flex items-start gap-2 rounded-xl bg-danger-4/60 px-4 py-3 text-sm text-danger-2"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div>
            <span className="mr-1 font-semibold">
              {t('errorLabel', 'copykiller.progress.error')}:
            </span>
            {job.errorMessage}
          </div>
        </div>
      ) : null}

      {/* ── 액션 버튼 ── */}
      <div className="flex flex-wrap gap-2">
        {isCompleted && job.resultAvailable && onDownload ? (
          <Button
            type="button"
            onClick={onDownload}
            analyticsKey="copykiller_download"
            className="gap-2"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {t('downloadCta', 'copykiller.progress.download')}
          </Button>
        ) : null}

        {isRunning && onCancel ? (
          <Button
            type="button"
            onClick={onCancel}
            analyticsKey="copykiller_cancel"
            className="gap-2 bg-neutral-3 hover:bg-neutral-2"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            {t('cancelCta', 'copykiller.progress.cancel')}
          </Button>
        ) : null}
      </div>
    </section>
  );
}

export default JobProgressPanel;
