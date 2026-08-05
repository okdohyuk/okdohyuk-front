/* eslint-disable react/require-default-props */

'use client';

import React from 'react';
import { cn } from '@utils/cn';
import type { FavoriteNotice } from './FavoriteStarButton';

type FavoriteNoticeRegionProps = {
  notice: FavoriteNotice | null;
  /**
   * `inline` — 문서 흐름 안에 배치(카드 그리드 위 등, 주변 여백이 이미 확보된 곳).
   * `fixed`  — 화면 하단 고정. 목록 최상단에 끼워 넣어 콘텐츠를 밀어내는 레이아웃 시프트를 막는다.
   */
  variant?: 'inline' | 'fixed';
  className?: string;
};

/**
 * 즐겨찾기 조작 결과를 알리는 live region.
 * 토스트 패키지를 새로 들이지 않고 aria-live 로 상태를 알린다.
 * 문구가 없을 때도 DOM 을 유지해야 스크린리더가 갱신을 읽어준다.
 */
export default function FavoriteNoticeRegion({
  notice,
  variant = 'inline',
  className = '',
}: FavoriteNoticeRegionProps) {
  const isFixed = variant === 'fixed';

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        notice ? 'block' : 'sr-only',
        // 고정 배너는 문서 흐름에서 빠져 있어야 목록이 밀리지 않는다.
        // 자체는 클릭을 가로채지 않게 하고, 실제 배너에만 포인터 이벤트를 돌려준다.
        isFixed && notice && 'pointer-events-none fixed inset-x-0 bottom-4 z-50 px-4 pb-safe',
        className,
      )}
    >
      {notice ? (
        <p
          className={cn(
            'rounded-2xl border px-4 py-3 text-sm font-medium',
            // 다크 모드에서 --danger-1/--success-1 은 그대로라 대비가 낮다.
            // globals.css 의 --status-*-fg 가 다크에서 3단계 톤으로 바뀌는 규칙을 그대로 따른다.
            notice.tone === 'error'
              ? 'border-danger-2/60 bg-danger-4 text-danger-1 dark:text-danger-3'
              : 'border-success-2/60 bg-success-4 text-success-1 dark:text-success-3',
            isFixed && 'pointer-events-auto mx-auto w-fit max-w-full shadow-lg backdrop-blur-md',
          )}
        >
          {notice.message}
        </p>
      ) : null}
    </div>
  );
}
