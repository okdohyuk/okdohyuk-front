'use client';

import React, { Suspense, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { sendGAEvent } from '@libs/client/gtag';

// useSearchParams는 Next.js 15 App Router에서 Suspense 경계 안에서만 사용 가능
function RouteChangeTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    const search = searchParams?.toString() ?? '';
    const key = search ? `${pathname}?${search}` : pathname;

    // 동일 URL 중복 발화 방지 (StrictMode 등)
    if (lastTrackedRef.current === key) return;
    lastTrackedRef.current = key;

    sendGAEvent('page_view', pathname);
  }, [pathname, searchParams]);

  return null;
}

export default function RouteChangeTracker() {
  return (
    <Suspense fallback={null}>
      <RouteChangeTrackerInner />
    </Suspense>
  );
}
