'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { sendGAEvent } from '@libs/client/gtag';

export default function MultiLiveTracker(): null {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    // /ko/multi-live/youtube:xxx/twitch:yyy 형태에서 slug 파싱
    const segments = pathname.split('/');
    // [empty, lng, 'multi-live', ...slugParts]
    const slugParts = segments.slice(3).filter(Boolean);
    if (slugParts.length === 0) return; // 진입 화면 (slug 없음) — 이벤트 없음

    const platforms = slugParts.map((s) => decodeURIComponent(s).split(':')[0]).join(',');
    sendGAEvent('live_view', pathname, {
      stream_count: slugParts.length,
      platforms,
    });
  }, [pathname]);

  return null;
}
