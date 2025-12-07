import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { dir } from 'i18next';
import localFont from 'next/font/local';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import CommonLayout from '@components/complex/Layout/CommonLayout';
import Footer from '@components/complex/Layout/Footer';
import { ReactQueryProvider } from '@components/complex/Layout/QueryClient';
import GoogleAdsense from '@components/google/GoogleAdsense';
import '~/styles/globals.scss';
import { Language, languages } from '~/app/i18n/settings';
import { StoreProvider } from './provider';

const pretendard = localFont({
  src: '../../assets/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

export type LanguageParams = { params: Promise<{ lng: string }> };

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
  const language = lng as Language;

  return (
    <html lang={language} dir={dir(language)}>
      <body className={pretendard.className}>
        <StoreProvider>
          <ReactQueryProvider>
            <CommonLayout>{children}</CommonLayout>
            <Footer lng={language} />
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
