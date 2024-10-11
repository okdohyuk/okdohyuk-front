import React from 'react';
import Script from 'next/script';

const GoogleAdsense = ({ pid }: { pid: string }) => {
  if (process.env.NODE_ENV !== 'production') {
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
};

export default GoogleAdsense;
