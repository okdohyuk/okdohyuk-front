'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { copykillerApi, apiInstance } from '@api';
import type { CopykillerJobRequest } from '@api/Copykiller';
import { COPYKILLER_TERMINAL_STATUSES } from '@components/copykiller/types';

export const COPYKILLER_KEYS = {
  all: ['copykiller'] as const,
  jobs: () => [...COPYKILLER_KEYS.all, 'jobs'] as const,
  job: (jobId: string) => [...COPYKILLER_KEYS.all, 'job', jobId] as const,
};

// ============================================================
// useSubmitCopykillerJob
// multipart/form-data 업로드. generated client 가 options JSON part
// 를 지원하지 않을 수 있으므로 axios 직접 호출 fallback.
// ============================================================
export interface SubmitCopykillerJobPayload {
  file: File;
  options: CopykillerJobRequest;
}

export const useSubmitCopykillerJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, options }: SubmitCopykillerJobPayload) => {
      const formData = new FormData();
      formData.append('file', file);
      // options 파트는 application/json 인코딩 필요 (OpenAPI 3.0 encoding.contentType)
      // Blob 래핑으로 Content-Type 명시.
      formData.append('options', new Blob([JSON.stringify(options)], { type: 'application/json' }));

      // Content-Type 헤더를 명시하지 않으면 axios가 FormData 감지 시
      // 자동으로 'multipart/form-data; boundary=...' 를 설정한다.
      // Authorization 헤더는 apiInstance request interceptor가 자동 첨부하므로 중복 전달 불필요.
      const response = await apiInstance.post('/copykiller/jobs', formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COPYKILLER_KEYS.jobs() });
    },
  });
};

// ============================================================
// useCopykillerJob
// 단건 조회 + 5초 폴링 (종료 상태 도달 시 자동 중단)
// ============================================================
export const useCopykillerJob = (jobId: string | null) => {
  return useQuery({
    queryKey: COPYKILLER_KEYS.job(jobId ?? ''),
    queryFn: async () => {
      // authorization 파라미터는 apiInstance interceptor가 자동 처리.
      // generated client가 required로 선언하므로 빈 문자열을 전달하면 assertParamExists는 통과하나
      // interceptor가 실제 토큰으로 덮어쓰므로 동작에 영향 없음.
      // 일관성을 위해 빈 문자열 대신 interceptor에만 의존한다.
      const { data } = await copykillerApi.getCopykillerJob(jobId!, '');
      return data;
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status) return 5000;
      return COPYKILLER_TERMINAL_STATUSES.has(status) ? false : 5000;
    },
  });
};

// ============================================================
// useCopykillerJobs
// 잡 목록 조회
// ============================================================
export const useCopykillerJobs = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: COPYKILLER_KEYS.jobs(),
    queryFn: async () => {
      // authorization: interceptor가 자동 주입. 빈 문자열로 assertParamExists 통과.
      const { data } = await copykillerApi.getCopykillerJobs('');
      return data;
    },
    enabled: options?.enabled ?? true,
  });
};

// ============================================================
// useCancelCopykillerJob
// 진행 중 잡 취소 (DELETE → 204)
// ============================================================
export const useCancelCopykillerJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      // authorization: interceptor가 자동 주입. 빈 문자열로 assertParamExists 통과.
      await copykillerApi.deleteCopykillerJob(jobId, '');
    },
    onSuccess: (_data, jobId) => {
      queryClient.invalidateQueries({ queryKey: COPYKILLER_KEYS.job(jobId) });
      queryClient.invalidateQueries({ queryKey: COPYKILLER_KEYS.jobs() });
    },
  });
};

// ============================================================
// useDownloadCopykillerResult
// blob fetch + Content-Disposition 파싱 + 브라우저 다운로드 트리거
// generated client 가 binary response 미지원 → apiInstance 직접 호출.
// apiInstance 사용으로 401 refresh / 403 redirect interceptor 적용됨.
// ============================================================
export const useDownloadCopykillerResult = () => {
  return useMutation({
    mutationFn: async (jobId: string) => {
      // Authorization 헤더는 apiInstance request interceptor가 자동 주입.
      const response = await apiInstance.get(`/copykiller/jobs/${jobId}/result`, {
        responseType: 'blob',
      });

      // Content-Disposition 파싱 — filename* (RFC 5987) 우선, 없으면 filename
      const disposition: string = response.headers['content-disposition'] ?? '';
      let filename = `copykiller_result_${jobId}.docx`;

      const filenameStarMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
      if (filenameStarMatch) {
        try {
          filename = decodeURIComponent(filenameStarMatch[1]);
        } catch {
          // 디코드 실패 시 기본값 유지
        }
      } else {
        const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);
        if (filenameMatch) {
          [, filename] = filenameMatch;
        }
      }

      // 브라우저 다운로드 트리거
      const blobUrl = URL.createObjectURL(response.data as Blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(blobUrl);
    },
  });
};
