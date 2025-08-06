import React from 'react';

import '~/styles/globals.scss';
import { StoreProvider } from './provider';
import { ReactQueryProvider } from '@components/complex/Layout/QueryClient';
import { Language, languages } from '~/app/i18n/settings';
import { dir } from 'i18next';
import localFont from 'next/font/local';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import CommonLayout from '@components/complex/Layout/CommonLayout';
import Footer from '@components/complex/Layout/Footer';
import { headers } from 'next/headers';
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@next/third-parties/google';
import GoogleAdsense from '@components/google/GoogleAdsense';
import { SpeedInsights } from '@vercel/speed-insights/next';

const pretendard = localFont({
  src: '../../assets/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

export type LanguageParams = { params: Promise<{ lng: Language }> };

export type ChildrenProps = {
  children: React.ReactNode;
};

export const generateMetadata: GenerateMetadata = ({ params }) =>
  translationsMetadata({ params, ns: 'index' });

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

type RootLayoutProps = ChildrenProps & LanguageParams;

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { lng } = await params;
  const pathname = headers().get('next-url') || '';
  const hideFooter = pathname.includes('/multi-live');

  return (
    <html lang={lng} dir={dir(lng)}>
      <body className={pretendard.className}>
        <StoreProvider>
          <ReactQueryProvider>
            <CommonLayout>{children}</CommonLayout>
            {!hideFooter && <Footer lng={lng} />}
            <Analytics />
            <SpeedInsights />
            <GoogleAnalytics gaId={`${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_TRACKING_ID}`} />
            <GoogleAdsense pid={`${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID}`} />
          </ReactQueryProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
