import React from 'react';
import { notFound } from 'next/navigation';
import { Viewport } from 'next';
import InstallApp from '@components/complex/InstallApp';
import InteractiveLanding from '@components/complex/Home/InteractiveLanding';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
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
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#AA90FA',
};

export default async function Home({ params }: LanguageParams) {
  const { lng } = await params;
  const language = stringToLanguage(lng);

  // redirect to notfound
  if (!language) notFound();
  const { t } = await getServerTranslation(language, 'index');

  return (
    <>
      <InstallApp text={t('downloads')} />
      <InteractiveLanding
        language={language}
        domain={t('domain')}
        title={t('title')}
        subTitle={t('subTitle')}
      />
    </>
  );
}
