'use client';

import React from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';

function GoogleAdsense({ pid }: { pid: string }) {
  const pathname = usePathname();

  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  // 어드민 콘솔에서는 광고를 노출하지 않는다
  if (pathname?.split('/').includes('admin')) {
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pid}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}

export default GoogleAdsense;
