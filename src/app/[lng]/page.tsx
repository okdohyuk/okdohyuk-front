import React from 'react';
import { useTranslation } from '~/app/i18n';
import InstallApp from '@components/complex/InstallApp';
import { languages } from '~/app/i18n/settings';
import { translationsMetadata, GenerateMetadata } from '@libs/server/customMetadata';
import { notFound } from 'next/navigation';
import { stringToLanguage } from '@utils/localeUtil';
import { LanguageParams } from '~/app/[lng]/layout';
import HomeClient from './components/HomeClient';

export const generateMetadata: GenerateMetadata = async ({ params }) => {
  const { lng } = await params;
  return translationsMetadata({
    params,
    ns: stringToLanguage(lng) === null ? 'notFound' : 'index',
  });
};

export default async function Home({ params }: LanguageParams) {
  const { lng } = await params;

  if (languages.indexOf(lng) < 0) notFound();
  const { t } = await useTranslation(lng, 'index');

  return (
    <>
      <InstallApp text={t('downloads')} />
      <HomeClient lng={lng} />
    </>
  );
}
