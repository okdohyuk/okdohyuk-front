import React from 'react';
import Image from 'next/legacy/image';
import { notFound } from 'next/navigation';
import { Viewport } from 'next';
import InstallApp from '@components/complex/InstallApp';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { useTranslation as getServerTranslation } from '~/app/i18n';
import { stringToLanguage } from '@utils/localeUtil';
import { LanguageParams } from '~/app/[lng]/layout';
import logoIcon from '../../../public/logo.svg';

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

      <div className="flex flex-col items-center gap-6 text-center px-4 py-12 lg:py-24">
        <h1 className="font-black t-t-1">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 via-white-500 to-point-1">
            {t('domain')}
          </span>
        </h1>
        <h2 className="t-t-2 max-w-md dark:text-white">{t('title')}</h2>
        <p className="t-d-1 t-basic-3">{t('subTitle')}</p>
      </div>

      <div className="flex justify-center">
        <Image priority src={logoIcon} alt="logo" width={250} height={250} />
      </div>
    </>
  );
}
