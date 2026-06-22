/* eslint-disable react/require-default-props */

/*
 * solve/ScoreRing.tsx — 총점 도넛 링 (oksolve ScoreRing 마이그레이션).
 *
 * conic-gradient로 정답 비율을 채우는 도넛. 채움 = point-2 토큰, 트랙 = basic-3 토큰,
 * 가운데 구멍 = basic-0 토큰. 마운트 시 solve-ring-sweep로 0→비율 보간(@property).
 * 중앙 숫자 = 정답 수, 캡션 = "/ 총문항".
 *
 * 동적 비율(--score)은 인라인 CSS 변수로 주입(plan: "--score 변수 주입 방식 유지").
 * conic-gradient는 토큰 CSS 변수를 직접 참조 → 다크모드 자동 대응.
 * 표현만 하므로 server component 가능.
 */
import * as React from 'react';
import { cn } from '@utils/cn';

export interface ScoreRingProps {
  /** 정답 문항 수. */
  correct: number;
  /** 전체 문항 수. */
  total: number;
  className?: string;
}

function ScoreRing({ correct, total, className }: ScoreRingProps) {
  const ratio = total > 0 ? correct / total : 0;
  const style = {
    '--score': ratio,
    '--solve-fill': `calc(var(--score) * 360deg)`,
    background: 'conic-gradient(var(--point-2) var(--solve-fill), var(--basic-3) 0)',
  } as React.CSSProperties;

  return (
    <div
      className={cn(
        'solve-score-ring relative mx-auto flex aspect-square items-center justify-center rounded-full',
        'w-[clamp(180px,56vw,232px)]',
        // 가운데 구멍(도넛): basic-0 토큰 + shadow-sm
        'before:absolute before:inset-3.5 before:rounded-full before:bg-basic-0 before:shadow-sm before:content-[""]',
        'motion-safe:animate-[solve-ring-sweep_600ms_ease_both]',
        className,
      )}
      style={style}
      role="img"
      aria-label={`총 ${total}문항 중 ${correct}문항 정답`}
    >
      <span className="relative z-[1] text-5xl font-black leading-none tracking-tight tabular-nums text-fg-1">
        {correct}
      </span>
      <span className="absolute bottom-[clamp(34px,12vw,48px)] z-[1] text-sm font-semibold tabular-nums text-fg-5">
        / {total}
      </span>
    </div>
  );
}

export { ScoreRing };
