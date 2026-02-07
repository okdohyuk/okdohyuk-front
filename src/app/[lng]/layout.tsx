import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { dir } from 'i18next';
import { Viewport } from 'next';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import CommonLayout from '@components/complex/Layout/CommonLayout';
import Footer from '@components/complex/Layout/Footer';
import { ReactQueryProvider } from '@components/complex/Layout/QueryClient';
import GoogleAdsense from '@components/google/GoogleAdsense';
import '~/styles/globals.css';
import { Language, languages } from '~/app/i18n/settings';
import { StoreProvider } from './provider';

export type LanguageParams = { params: Promise<{ lng: string }> };

export type ChildrenProps = {
  children: React.ReactNode;
};

export const generateMetadata: GenerateMetadata = ({ params }) =>
  translationsMetadata({ params, ns: 'index' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#AA90FA',
};

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

type RootLayoutProps = ChildrenProps & LanguageParams;

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { lng } = await params;
  const language = lng as Language;
  const enableThirdPartyTracking = process.env.NEXT_PUBLIC_ENABLE_THIRD_PARTY_TRACKING === 'true';
  const gaTrackingId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_TRACKING_ID;
  const googleAdsenseClientId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID;

  return (
    <html lang={language} dir={dir(language)}>
      <body>
        <StoreProvider>
          <ReactQueryProvider>
            <CommonLayout>{children}</CommonLayout>
            <Footer lng={language} />
            {enableThirdPartyTracking && (
              <>
                <Analytics />
                <SpeedInsights />
                {gaTrackingId && <GoogleAnalytics gaId={gaTrackingId} />}
                {googleAdsenseClientId && <GoogleAdsense pid={googleAdsenseClientId} />}
              </>
            )}
          </ReactQueryProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
