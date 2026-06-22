/* eslint-disable react/require-default-props */

/*
 * solve/ProgressBar.tsx — 진행률 바 (oksolve ProgressBar 마이그레이션).
 *
 * 트랙 basic-3 + 채움 point-2 토큰. 채움 폭은 동적 값이라 인라인 width로 주입하고
 * 200ms width transition. role=progressbar + aria-valuenow로 접근성 보장.
 * 표현만 하므로 server component 가능.
 */
import * as React from 'react';
import { cn } from '@utils/cn';

export interface ProgressBarProps {
  /** 진행률 0~1. */
  value: number;
  /** 접근성 라벨(기본 "진행률"). */
  label?: string;
  className?: string;
}

function ProgressBar({ value, label = '진행률', className }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 1);
  const percent = Math.round(clamped * 100);

  return (
    <div
      className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-basic-3', className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <div
        className="h-full rounded-full bg-point-2 transition-[width] duration-200 ease-out"
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  );
}

export { ProgressBar };
