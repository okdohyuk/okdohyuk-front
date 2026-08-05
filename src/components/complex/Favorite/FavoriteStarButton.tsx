/* eslint-disable react/require-default-props */

'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@utils/cn';

export type FavoriteNotice = { message: string; tone: 'success' | 'error' };

type FavoriteStarButtonProps = {
  isFavorite: boolean;
  /** 접근성 라벨 겸 툴팁. 부모가 i18n 을 해석해 넘긴다. */
  label: string;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
};

/**
 * 즐겨찾기 별 토글의 **표시 전용** 컴포넌트.
 *
 * 데이터 훅을 전혀 구독하지 않는다. `/menu` 처럼 수십 개가 한 화면에 놓이는 곳에서
 * 항목마다 React Query 구독이 생기지 않도록, 상태는 부모가 `useFavoriteToggle` 로 한 번만 만든다.
 */
export default function FavoriteStarButton({
  isFavorite,
  label,
  onToggle,
  disabled = false,
  className = '',
}: FavoriteStarButtonProps) {
  return (
    <button
      type="button"
      onClick={(event) => {
        // 카드 전체가 링크인 목록 안에서도 쓰이므로 상위 네비게이션을 막는다.
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
      aria-pressed={isFavorite}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-basic-3 bg-basic-0/90 text-fg-5 transition-colors',
        'hover:border-point-2/70 hover:text-point-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        isFavorite && 'border-point-2/70 text-point-fg',
        className,
      )}
    >
      <Star className={cn('h-4 w-4', isFavorite && 'fill-current')} aria-hidden />
    </button>
  );
}
