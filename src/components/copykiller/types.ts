/**
 * Copykiller 컴포넌트 타입 — generated API 타입 재export + UI 전용 타입
 * yarn generate-api 후 '@api/Copykiller' 를 직접 사용.
 */

// generated 타입 재export (컴포넌트에서 단일 import 경로 유지)
// 이전 CopykillerJobView alias — CopykillerJob 으로 교체
import type { CopykillerJob } from '@api/Copykiller';

export type { CopykillerJob, CopykillerJobList, CopykillerJobRequest } from '@api/Copykiller';
export { CopykillerDocType, CopykillerJobStatus, CopykillerStyleMode } from '@api/Copykiller';
export type CopykillerJobView = CopykillerJob;

/** 진행 중 상태 집합 (폴링 유지 조건) */
export const COPYKILLER_RUNNING_STATUSES: ReadonlySet<string> = new Set([
  'QUEUED',
  'REGISTERING',
  'CHECKING',
  'EXTRACTING',
  'REWRITING',
  'RECHECKING',
]);

/** 종료 상태 집합 */
export const COPYKILLER_TERMINAL_STATUSES: ReadonlySet<string> = new Set([
  'COMPLETED',
  'FAILED',
  'CANCELED',
]);

/** 업로드 폼 제출 데이터 */
export interface DocxUploadFormData {
  file: File;
  docType: 'PAPER' | 'THESIS' | 'SPEECH' | 'REPORT' | 'SOP' | 'FREE';
  styleMode: 'KEEP' | 'PRESET';
  targetPlag: number;
  targetAi: number;
  maxIterations: number;
}
