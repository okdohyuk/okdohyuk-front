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

function GoogleAd({ slotId, className = '' }: GoogleAdProps) {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!insRef.current || insRef.current.offsetWidth === 0) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) {
      // adsbygoogle push errors are non-fatal
    }
  }, []);

  return (
    <div className={className}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
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
