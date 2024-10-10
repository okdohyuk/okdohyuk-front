import React, { useEffect } from 'react';
import '~/styles/globals.scss';
import { AppProps } from 'next/app';
import { Provider } from 'mobx-react';
import stores from '@stores';
import { useRouter } from 'next/router';
import * as gtag from '@libs/client/gtag';
import { appWithTranslation } from 'next-i18next';
import CommonLayout from '@components/legacy/complex/Layout/CommonLayout';
import { Analytics } from '@vercel/analytics/react';
import AxiosInterceptor from '@components/legacy/complex/Layout/AxiosInterceptor';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

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
      <QueryClientProvider client={queryClient}>
        <CommonLayout>
          <Component {...pageProps} />
          <Analytics />
          <AxiosInterceptor />
        </CommonLayout>
      </QueryClientProvider>
    </Provider>
  );
}

export default appWithTranslation(MyApp);
