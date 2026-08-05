import React from 'react';
import { notFound } from 'next/navigation';
import { Viewport } from 'next';
import InstallApp from '@components/complex/InstallApp';
import HomeGate from '@components/complex/Home/HomeGate';
import FavoritesHome from '@components/complex/Home/FavoritesHome';
import LandingHome from '@components/complex/Home/Landing/LandingHome';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { getLandingCopy } from '@libs/server/landingCopy';
import { useTranslation as getServerTranslation } from '~/app/i18n';
import { languages } from '~/app/i18n/settings';
import { stringToLanguage } from '@utils/localeUtil';
import { LanguageParams } from '~/app/[lng]/layout';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) => {
  const { lng } = await params;
  return translationsMetadata({
    params,
    ns: stringToLanguage(lng) === null ? 'notFound' : 'index',
  });
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#AA90FA',
};

export default async function Home({ params }: LanguageParams) {
  const { lng } = await params;
  const language = stringToLanguage(lng);

  // redirect to notfound
  if (!language) notFound();
  const { t } = await getServerTranslation(language, 'index');
  const copy = await getLandingCopy(language);

  return (
    <>
      <InstallApp text={t('downloads')} />
      {/* 로그인 분기: 서버는 항상 랜딩을 렌더하고, 세션이 확인되면 즐겨찾기 홈으로 교체된다. */}
      <HomeGate
        landing={<LandingHome lng={language} copy={copy} />}
        favorites={<FavoritesHome lng={language} />}
      />
    </>
  );
}
