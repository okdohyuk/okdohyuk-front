'use client';

import { useRef, useCallback } from 'react';
import { sendGAEvent } from '@libs/client/gtag';

export type ToolCategory = 'generator' | 'converter' | 'calculator' | 'text' | 'utility';

type TrackUseOptions = {
  action_type: string;
  success: boolean;
  error_code?: string;
  [key: string]: unknown;
};

type TrackCopyOptions = {
  result_format?: string;
};

type TrackShareOptions = {
  channel?: string;
};

/**
 * 도구 페이지의 공통 GA4 이벤트(4종)를 발화하는 훅.
 * - tool_input_started: 첫 입력 시 세션당 1회
 * - tool_use: 핵심 액션(생성/계산/변환) 실행 시
 * - tool_copy_result: 결과 복사 시
 * - tool_share_result: 결과 공유 시
 */
export function useToolTracking(toolId: string, category: ToolCategory) {
  const inputStartedRef = useRef(false);

  const trackInputStarted = useCallback(() => {
    if (inputStartedRef.current) return;
    inputStartedRef.current = true;
    sendGAEvent('tool_input_started', toolId, {
      tool_id: toolId,
      tool_category: category,
    });
  }, [toolId, category]);

  const trackUse = useCallback(
    ({ action_type, success, error_code, ...rest }: TrackUseOptions) => {
      sendGAEvent('tool_use', toolId, {
        tool_id: toolId,
        tool_category: category,
        action_type,
        success,
        ...(error_code ? { error_code } : {}),
        ...rest,
      });
    },
    [toolId, category],
  );

  const trackCopy = useCallback(
    ({ result_format = 'text' }: TrackCopyOptions = {}) => {
      sendGAEvent('tool_copy_result', toolId, {
        tool_id: toolId,
        tool_category: category,
        result_format,
      });
    },
    [toolId, category],
  );

  const trackShare = useCallback(
    ({ channel = 'native' }: TrackShareOptions = {}) => {
      sendGAEvent('tool_share_result', toolId, {
        tool_id: toolId,
        tool_category: category,
        channel,
      });
    },
    [toolId, category],
  );

  return { trackInputStarted, trackUse, trackCopy, trackShare };
}
