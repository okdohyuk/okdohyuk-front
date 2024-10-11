'use client';

import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any;
  }
}

type GoogleAdProps = {
  slotId: string;
  type?: string;
  className?: string;
};

const GoogleAd = ({ slotId, className }: GoogleAdProps) => {
  useEffect(() => {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID}
        data-ad-slot={String(slotId)}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default GoogleAd;
