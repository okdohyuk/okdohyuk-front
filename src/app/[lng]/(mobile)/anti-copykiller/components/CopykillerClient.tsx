'use client';

import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import SponsorGate from '@components/copykiller/SponsorGate';
import DocxUploadForm from '@components/copykiller/DocxUploadForm';
import JobProgressPanel from '@components/copykiller/JobProgressPanel';
import JobHistoryList from '@components/copykiller/JobHistoryList';
import type { DocxUploadFormData } from '@components/copykiller/types';
import { COPYKILLER_TERMINAL_STATUSES } from '@components/copykiller/types';
import {
  useSubmitCopykillerJob,
  useCopykillerJobs,
  useCopykillerJob,
  useCancelCopykillerJob,
  useDownloadCopykillerResult,
} from '@queries/useCopykillerQueries';
import useStore from '@hooks/useStore';
import type { Language } from '~/app/i18n/settings';
import type { CopykillerJob } from '@api/Copykiller';

const LOCALE_BY_LNG: Record<string, string> = {
  ko: 'ko-KR',
  ja: 'ja-JP',
  zh: 'zh-CN',
  en: 'en-US',
};

interface CopykillerClientProps {
  lng: Language;
}

function CopykillerClient({ lng }: CopykillerClientProps) {
  const { t } = useTranslation('copykiller');
  const { user } = useStore('userStore');

  // 활성 잡 ID — 제출 성공 시 설정, 종료 상태 도달 시 null 가능
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // 잡 목록 조회 — 권한 있는 사용자만 (비로그인 시 401 → 자동 로그아웃 방지)
  const isAuthorized = user?.role === 'SPONSOR' || user?.role === 'ADMIN';
  const { data: jobsData } = useCopykillerJobs({ enabled: isAuthorized });

  // 제출 성공 직후 activeJobId 가 없을 때 목록에서 진행 중 잡 찾기
  const runningJobFromList = jobsData?.jobs?.find(
    (j) => !COPYKILLER_TERMINAL_STATUSES.has(j.status),
  );
  const resolvedJobId = activeJobId ?? runningJobFromList?.id ?? null;

  // 단건 폴링 (5초 간격, 종료 상태 도달 시 자동 중단) — 인증된 사용자만
  const { data: activeJobData } = useCopykillerJob(isAuthorized ? resolvedJobId : null);

  const activeJob: CopykillerJob | null = activeJobData ?? null;

  // 뮤테이션 훅
  const submitMutation = useSubmitCopykillerJob();
  const cancelMutation = useCancelCopykillerJob();
  const downloadMutation = useDownloadCopykillerResult();

  // 폼 제출 핸들러
  const handleSubmit = useCallback(
    async (data: DocxUploadFormData) => {
      const result = await submitMutation.mutateAsync({
        file: data.file,
        options: {
          docType: data.docType,
          styleMode: data.styleMode,
          targetPlag: data.targetPlag,
          targetAi: data.targetAi,
          maxIterations: data.maxIterations,
        },
      });
      setActiveJobId((result as CopykillerJob).id);
    },
    [submitMutation],
  );

  // 취소 핸들러
  const handleCancel = useCallback(async () => {
    if (!resolvedJobId) return;
    await cancelMutation.mutateAsync(resolvedJobId);
    setActiveJobId(null);
  }, [cancelMutation, resolvedJobId]);

  // 다운로드 핸들러 (활성 잡)
  const handleDownload = useCallback(async () => {
    if (!resolvedJobId) return;
    await downloadMutation.mutateAsync(resolvedJobId);
  }, [downloadMutation, resolvedJobId]);

  // 이력 다운로드 핸들러
  const handleHistoryDownload = useCallback(
    async (jobId: string) => {
      await downloadMutation.mutateAsync(jobId);
    },
    [downloadMutation],
  );

  // 활성 잡 여부 — 진행 중인 잡이 있으면 폼 숨김
  const hasActiveJob = activeJob !== null && !COPYKILLER_TERMINAL_STATUSES.has(activeJob.status);

  // 이력 목록 — 종료된 잡들 (활성 잡과 분리)
  const historyJobs =
    jobsData?.jobs?.filter((j) => COPYKILLER_TERMINAL_STATUSES.has(j.status)) ?? [];

  // 레이블 맵 (i18n → 컴포넌트 props)
  const formLabels: Record<string, string> = {
    dropzoneTitle: t('form.dropzoneTitle'),
    dropzoneHelper: t('form.dropzoneHelper'),
    dropzoneDrag: t('form.dropzoneDrag'),
    errorFileType: t('form.errorFileType'),
    errorFileSize: t('form.errorFileSize'),
    errorRequired: t('form.errorRequired'),
    fileLabel: t('form.fileLabel'),
    filePlaceholder: t('form.filePlaceholder'),
    fileHelper: t('form.fileHelper'),
    fileError: t('form.fileError'),
    fileRequired: t('form.fileRequired'),
    fileRemove: t('form.fileRemove'),
    docTypeLabel: t('form.docTypeLabel'),
    docTypeAriaLabel: t('form.docTypeAriaLabel'),
    docTypeOptionPAPER: t('form.docTypeOptions.PAPER'),
    docTypeOptionTHESIS: t('form.docTypeOptions.THESIS'),
    docTypeOptionSPEECH: t('form.docTypeOptions.SPEECH'),
    docTypeOptionREPORT: t('form.docTypeOptions.REPORT'),
    docTypeOptionSOP: t('form.docTypeOptions.SOP'),
    docTypeOptionFREE: t('form.docTypeOptions.FREE'),
    styleModeLabel: t('form.styleModeLabel'),
    styleModeAriaLabel: t('form.styleModeAriaLabel'),
    styleModeOptionKEEP: t('form.styleModeOptions.KEEP'),
    styleModeOptionPRESET: t('form.styleModeOptions.PRESET'),
    targetPlagLabel: t('form.targetPlagLabel'),
    targetPlagHelper: t('form.targetPlagHelper'),
    targetAiLabel: t('form.targetAiLabel'),
    targetAiHelper: t('form.targetAiHelper'),
    maxIterationsLabel: t('form.maxIterationsLabel'),
    maxIterationsHelper: t('form.maxIterationsHelper'),
    submit: t('form.submit'),
    submitting: t('form.submitting'),
  };

  const progressLabels: Record<string, string> = {
    title: t('progress.title'),
    iteration: t('progress.iteration'),
    plagPercent: t('progress.plagPercent'),
    aiPercent: t('progress.aiPercent'),
    notMeasuredYet: t('progress.notMeasuredYet'),
    downloadCta: t('progress.download'),
    cancelCta: t('progress.cancel'),
    statusQueued: t('status.QUEUED'),
    statusRegistering: t('status.REGISTERING'),
    statusChecking: t('status.CHECKING'),
    statusExtracting: t('status.EXTRACTING'),
    statusRewriting: t('status.REWRITING'),
    statusRechecking: t('status.RECHECKING'),
    statusCompleted: t('status.COMPLETED'),
    statusFailed: t('status.FAILED'),
    statusCanceled: t('status.CANCELED'),
  };

  const historyLabels: Record<string, string> = {
    title: t('history.title'),
    empty: t('history.empty'),
    filename: t('history.filename'),
    status: t('history.status'),
    createdAt: t('history.createdAt'),
    download: t('history.download'),
    downloadUnavailable: t('history.downloadUnavailable'),
    statusQueued: t('status.QUEUED'),
    statusRegistering: t('status.REGISTERING'),
    statusChecking: t('status.CHECKING'),
    statusExtracting: t('status.EXTRACTING'),
    statusRewriting: t('status.REWRITING'),
    statusRechecking: t('status.RECHECKING'),
    statusCompleted: t('status.COMPLETED'),
    statusFailed: t('status.FAILED'),
    statusCanceled: t('status.CANCELED'),
  };

  return (
    <SponsorGate
      userRole={user?.role ?? null}
      loginTitle={t('gate.login.title')}
      loginDescription={t('gate.login.description')}
      loginCta={t('gate.login.cta')}
      sponsorTitle={t('gate.sponsor.title')}
      sponsorDescription={t('gate.sponsor.description')}
      sponsorCta={t('gate.sponsor.cta')}
      loginHref={`/${lng}/auth/login`}
      sponsorHref="https://github.com/sponsors/okdohyuk?frequency=recurring"
    >
      <div className="space-y-6">
        {/* 활성 잡 진행 패널 */}
        {activeJob && (
          <JobProgressPanel
            job={activeJob}
            onDownload={activeJob.resultAvailable ? handleDownload : undefined}
            onCancel={hasActiveJob ? handleCancel : undefined}
            labels={progressLabels}
          />
        )}

        {/* 업로드 폼 — 활성 잡이 없을 때만 노출 */}
        {!hasActiveJob && (
          <DocxUploadForm
            onSubmit={handleSubmit}
            submitting={submitMutation.isPending}
            labels={formLabels}
          />
        )}

        {/* 이력 목록 */}
        <JobHistoryList
          jobs={historyJobs}
          onDownload={handleHistoryDownload}
          labels={historyLabels}
          locale={LOCALE_BY_LNG[lng] ?? 'en-US'}
        />
      </div>
    </SponsorGate>
  );
}

export default observer(CopykillerClient);
