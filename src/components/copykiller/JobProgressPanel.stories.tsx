import type { Meta, StoryObj } from '@storybook/react';
import JobProgressPanel from './JobProgressPanel';
import type { CopykillerJobView } from './types';

const BASE_JOB: CopykillerJobView = {
  id: 'job-uuid-001',
  status: 'QUEUED',
  docType: 'PAPER',
  styleMode: 'KEEP',
  targetPlag: 10,
  targetAi: 40,
  maxIterations: 5,
  currentIteration: 0,
  plagPercent: null,
  aiPercent: null,
  originalFilename: 'sample_thesis.docx',
  resultAvailable: false,
  errorMessage: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const STATUS_LABELS = {
  title: '잡 진행 현황',
  iteration: '{cur} / {max} 반복',
  plagPercent: '표절률',
  aiPercent: 'AI 작성률',
  downloadCta: '결과 다운로드',
  cancelCta: '취소',
  errorLabel: '오류',
  statusQueued: '대기',
  statusRegistering: '등록',
  statusChecking: '검사',
  statusExtracting: '추출',
  statusRewriting: '재작성',
  statusRechecking: '재검사',
  statusCompleted: '완료',
  statusFailed: '실패',
  statusCanceled: '취소됨',
};

const meta: Meta<typeof JobProgressPanel> = {
  title: 'Copykiller/JobProgressPanel',
  component: JobProgressPanel,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    labels: STATUS_LABELS,
    onDownload: () => console.log('download'), // eslint-disable-line no-console
    onCancel: () => console.log('cancel'), // eslint-disable-line no-console
  },
};

export default meta;
type Story = StoryObj<typeof JobProgressPanel>;

export const Queued: Story = {
  args: { job: { ...BASE_JOB, status: 'QUEUED' } },
};

export const Registering: Story = {
  args: { job: { ...BASE_JOB, status: 'REGISTERING' } },
};

export const Checking: Story = {
  args: {
    job: { ...BASE_JOB, status: 'CHECKING', currentIteration: 1 },
  },
};

export const Rewriting: Story = {
  args: {
    job: {
      ...BASE_JOB,
      status: 'REWRITING',
      currentIteration: 2,
      plagPercent: 25,
      aiPercent: 60,
    },
  },
};

export const Completed: Story = {
  args: {
    job: {
      ...BASE_JOB,
      status: 'COMPLETED',
      currentIteration: 3,
      plagPercent: 8,
      aiPercent: 35,
      resultAvailable: true,
    },
  },
};

export const Failed: Story = {
  args: {
    job: {
      ...BASE_JOB,
      status: 'FAILED',
      currentIteration: 1,
      errorMessage: 'AI 재작성 일시 불가 — 잠시 후 다시 시도해 주세요.',
    },
  },
};

export const Canceled: Story = {
  args: {
    job: { ...BASE_JOB, status: 'CANCELED', currentIteration: 2 },
  },
};
