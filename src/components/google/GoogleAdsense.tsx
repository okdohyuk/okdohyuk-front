'use client';

import React from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { markAdsenseScriptLoaded } from '@libs/client/adsenseScript';
import { isAdEligiblePath } from '@libs/client/adPolicy';

function GoogleAdsense({ pid }: { pid: string }) {
  const pathname = usePathname();

  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  if (!isAdEligiblePath(pathname ?? '')) {
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pid}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
      onLoad={markAdsenseScriptLoaded}
    />
  );
}

export default GoogleAdsense;
