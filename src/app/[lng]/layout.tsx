import React from 'react';

import '~/styles/globals.scss';
import { StoreProvider } from './provider';
import { languages } from '~/app/i18n/settings';
import { dir } from 'i18next';
import localFont from 'next/font/local';
import { translationsMetadata, GenerateMetadata } from '@libs/server/customMetadata';
import CommonLayout from '@components/complex/Layout/CommonLayout';
import AxiosInterceptor from '@components/complex/Layout/AxiosInterceptor';
import { Analytics } from '@vercel/analytics/react';

const pretendard = localFont({
  src: '../../assets/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

export const generateMetadata: GenerateMetadata = ({ params }) =>
  translationsMetadata({ params, ns: 'index' });

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export default function RootLayout({
  children,
  params: { lng },
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  return (
    <html lang={lng} dir={dir(lng)}>
      <body className={pretendard.className}>
        <StoreProvider>
          <CommonLayout>{children}</CommonLayout>
          <Analytics />
          <AxiosInterceptor />
        </StoreProvider>
      </body>
    </html>
  );
}
