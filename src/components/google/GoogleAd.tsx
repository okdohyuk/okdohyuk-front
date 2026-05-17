'use client';

import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: any;
  }
}

type GoogleAdProps = {
  slotId: string;
  className?: string;
};

const MIN_AD_WIDTH = 250;

function GoogleAd({ slotId, className = '' }: GoogleAdProps) {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const el = insRef.current;
    if (!el) return undefined;

    let pushed = false;
    let ro: ResizeObserver | null = null;
    let io: IntersectionObserver | null = null;

    // 폭이 확보되고 뷰포트에 들어왔을 때 1회만 push.
    // 기존 구현은 mount 직후 1회 측정만 했기 때문에, flex/grid 부모가 초기 폭=0이면
    // 광고가 영구히 노출되지 않으면서 AdSense는 별도 경로로 push를 시도해 No-slot-size 에러를 던졌다.
    const tryPush = () => {
      if (pushed || !el.isConnected) return;
      if (el.offsetWidth < MIN_AD_WIDTH) return;
      pushed = true;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // adsbygoogle.push의 동기 throw만 흡수. 비동기 TagError는 Sentry로 보내 모니터링 유지.
      }
      ro?.disconnect();
      io?.disconnect();
    };

    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(tryPush);
      ro.observe(el);
    }
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) tryPush();
      });
      io.observe(el);
    }

    tryPush();

    return () => {
      ro?.disconnect();
      io?.disconnect();
    };
  }, []);

  return (
    <div className={className} style={{ minWidth: MIN_AD_WIDTH, minHeight: 100 }}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', minWidth: MIN_AD_WIDTH, minHeight: 100 }}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID}
        data-ad-slot={String(slotId)}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

export default GoogleAd;

GoogleAd.defaultProps = {
  className: '',
};
