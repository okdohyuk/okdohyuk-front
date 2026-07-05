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
  const wrapRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const el = insRef.current;
    if (!wrap || !el) return undefined;

    let pushed = false;
    let ro: ResizeObserver | null = null;
    let io: IntersectionObserver | null = null;

    // 폭이 확보되고 뷰포트에 들어왔을 때 1회만 push.
    // AdSense가 계산하는 availableWidth는 <ins>가 아니라 부모(래퍼)의 콘텐츠 폭이다.
    // 과거 구현은 <ins>에 min-width를 걸고 <ins>.offsetWidth로 가드했는데,
    // min-width는 부모 폭이 0이어도 offsetWidth를 그 값 이상으로 부풀려(overflow)
    // 가드가 항상 통과 → 0폭 부모에서 push가 나가 No-slot-size(availableWidth=0)를 유발했다.
    // 따라서 래퍼(실제 가용 폭)를 측정하고, <ins>는 width:100%로 래퍼를 그대로 따르게 한다.
    const tryPush = () => {
      if (pushed || !el.isConnected) return;
      if (wrap.offsetWidth < MIN_AD_WIDTH) return;
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
      ro.observe(wrap);
    }
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) tryPush();
      });
      io.observe(wrap);
    }

    tryPush();

    return () => {
      ro?.disconnect();
      io?.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className={className} style={{ minHeight: 100 }}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: 100 }}
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
