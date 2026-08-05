'use client';

import React, { useEffect, useRef } from 'react';
import { sendGAEvent } from '@libs/client/gtag';

type SectionViewTrackerProps = {
  /** GA `landing_section_view` 의 value 로 전송할 섹션 식별자 */
  section: string;
};

/**
 * 부모 섹션이 뷰포트에 처음 들어올 때 `landing_section_view` 를 1회 발화한다.
 * 서버 컴포넌트 섹션 안에 얇게 끼워 넣어 클라이언트 경계를 최소화하기 위한 컴포넌트.
 */
export default function SectionViewTracker({ section }: SectionViewTrackerProps) {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const target = markerRef.current?.parentElement;
    if (!target || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          sendGAEvent('landing_section_view', section);
          observer.disconnect();
        });
      },
      { threshold: 0.25 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [section]);

  return <span ref={markerRef} aria-hidden className="hidden" />;
}
