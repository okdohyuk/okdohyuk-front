import type { Meta, StoryObj } from '@storybook/react';
import DocxUploadForm from './DocxUploadForm';

const meta: Meta<typeof DocxUploadForm> = {
  title: 'Copykiller/DocxUploadForm',
  component: DocxUploadForm,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    labels: {
      dropzoneTitle: '.docx 파일 업로드',
      dropzoneHelper: '최대 50MB · .docx 형식만 지원',
      dropzoneDrag: '클릭하거나 파일을 드래그하세요',
      fileRemove: '파일 제거',
      docTypeLabel: '문서 유형',
      styleModeLabel: '문체 유지 방식',
      targetPlagLabel: '목표 표절률 (%)',
      targetPlagHelper: '이 값 이하로 줄이는 것을 목표로 합니다 (기본값 10)',
      targetAiLabel: '목표 AI 작성률 (%)',
      targetAiHelper: '이 값 이하로 줄이는 것을 목표로 합니다 (기본값 40)',
      maxIterationsLabel: '최대 반복 횟수',
      maxIterationsHelper: '최대 10회까지 설정 가능 (기본값 5)',
      submit: '분석 시작',
      submitting: '처리 중...',
      paper: '논문',
      thesis: '학위논문',
      speech: '연설문',
      report: '보고서',
      sop: '자기소개서',
      free: '일반',
      keep: '원문 문체 유지',
      preset: '프리셋 적용',
    },
    onSubmit: async (data) => {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 1000);
      });
      console.log('submitted', data); // eslint-disable-line no-console
    },
  },
};

export default meta;
type Story = StoryObj<typeof DocxUploadForm>;

/** 기본 상태 */
export const Default: Story = {};

/** 제출 중 */
export const Submitting: Story = {
  args: {
    submitting: true,
  },
};
