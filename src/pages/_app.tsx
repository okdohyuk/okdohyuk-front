import React, { useEffect } from 'react';
import '~/styles/globals.css';
import { AppProps } from 'next/app';
import { Provider } from 'mobx-react';
import stores from '@stores';
import { useRouter } from 'next/router';
import * as gtag from '@libs/client/gtag';
import { appWithTranslation } from 'next-i18next';
import CommonLayout from '~/components/Complex/Layouts/CommonLayout';
import { Analytics } from '@vercel/analytics/react';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: URL) => {
      gtag.pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <Provider {...stores}>
      <CommonLayout>
        <Component {...pageProps} />
        <Analytics />
      </CommonLayout>
    </Provider>
  );
}

export default appWithTranslation(MyApp);
