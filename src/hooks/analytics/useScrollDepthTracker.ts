'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { sendGAEvent } from '@libs/client/gtag';

const THRESHOLDS = [25, 50, 75, 100] as const;

/**
 * 스크롤 깊이(25/50/75/100%) 도달 시 GA `scroll` 이벤트를 1회씩 발화한다.
 * - 라우트(pathname)가 바뀌면 도달 기록을 리셋한다.
 * - scroll 이벤트는 passive 리스너 + requestAnimationFrame 으로 throttle 한다.
 */
export function useScrollDepthTracker(): void {
  const pathname = usePathname();
  const reachedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    // pathname 변경 시 도달 기록 초기화
    reachedRef.current = new Set();

    let rafId: number | null = null;
    let ticking = false;

    const measure = () => {
      ticking = false;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const percent = (window.scrollY / docHeight) * 100;

      THRESHOLDS.forEach((threshold) => {
        if (percent >= threshold && !reachedRef.current.has(threshold)) {
          reachedRef.current.add(threshold);
          sendGAEvent('scroll', String(threshold), {
            percent_scrolled: threshold,
            page_path: pathname,
          });
        }
      });
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      rafId = window.requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // 초기 진입 시점에도 한 번 체크 (이미 페이지가 짧은 경우 100% 도달 가능)
    measure();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [pathname]);
}
