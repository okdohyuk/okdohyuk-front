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
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@next/third-parties/google';
import GoogleAdsense from '@components/google/GoogleAdsense';

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

  return (
    <html lang={lng} dir={dir(lng)}>
      <body className={pretendard.className}>
        <StoreProvider>
          <CommonLayout>{children}</CommonLayout>
          <Footer lng={lng} />
          <Analytics />
          <GoogleAnalytics gaId={`${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_TRACKING_ID}`} />
          <GoogleAdsense pid={`${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID}`} />
        </StoreProvider>
      </body>
    </html>
  );
}
