'use client';

/* eslint-disable react/require-default-props */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

type LandingCountUpProps = {
  /** 최종 수치. SSR HTML 에는 이 값이 그대로 박힌다(SEO / JS 미지원 폴백). */
  value: number;
  /** 수치 뒤에 붙는 단위·기호 ("+", "개", " 种" …) */
  suffix?: string;
  durationMs?: number;
};

/**
 * SSR 결과가 이미 최종값이라 `useEffect` 로 0 을 넣으면 페인트 후에 값이 뒤집혀 깜빡인다.
 * 레이아웃 이펙트는 페인트 전에 동기 재렌더를 유발하므로 깜빡임 없이 0 에서 출발할 수 있다.
 * (SSR 에서는 실행되지 않으므로 서버에서는 `useEffect` 로 대체 — React 경고 회피)
 */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** easeOutCubic — 초반에 빠르게 오르고 끝에서 부드럽게 멎는다. */
const easeOut = (progress: number) => 1 - (1 - progress) ** 3;

const IN_VIEW_THRESHOLD = 0.4;

/**
 * 뷰 진입 시 0 → 목표값으로 오르는 지표 숫자.
 *
 * - **SSR HTML 에는 최종값**이 들어간다(초기 state 가 `value`).
 * - `prefers-reduced-motion: reduce` 면 애니메이션 없이 최종값 그대로 둔다.
 * - `IntersectionObserver` 가 없는 환경은 마운트 즉시 재생한다.
 */
export default function LandingCountUp({
  value,
  suffix = '',
  durationMs = 1400,
}: LandingCountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node || value <= 0) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let rafId = 0;
    let started = false;
    setDisplay(0);

    const run = () => {
      if (started) return;
      started = true;
      const startedAt = performance.now();
      const step = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / durationMs);
        setDisplay(Math.round(easeOut(progress) * value));
        if (progress < 1) rafId = window.requestAnimationFrame(step);
      };
      rafId = window.requestAnimationFrame(step);
    };

    if (typeof IntersectionObserver !== 'function') {
      run();
      return () => window.cancelAnimationFrame(rafId);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          run();
          observer.disconnect();
        }
      },
      { threshold: IN_VIEW_THRESHOLD },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(rafId);
    };
  }, [value, durationMs]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}
