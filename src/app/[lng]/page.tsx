import React from 'react';
import Image from 'next/legacy/image';
import logoIcon from '../../../public/logo.svg';
import { useTranslation } from '~/app/i18n';
import InstallApp from '@components/complex/InstallApp';
import { languages } from '~/app/i18n/settings';
import { translationsMetadata, GenerateMetadata } from '@libs/server/customMetadata';
import { notFound } from 'next/navigation';
import { stringToLanguage } from '@utils/localeUtil';
import { LanguageParams } from '~/app/[lng]/layout';

export const generateMetadata: GenerateMetadata = async ({ params }) => {
  const { lng } = await params;
  return translationsMetadata({
    params,
    ns: stringToLanguage(lng) === null ? 'notFound' : 'index',
  });
};

export default async function Home({ params }: LanguageParams) {
  const { lng } = await params;

  // redirect to notfound
  if (languages.indexOf(lng) < 0) notFound();
  const { t } = await useTranslation(lng, 'index');

  return (
    <>
      <InstallApp text={t('downloads')} />

      <div className="flex flex-col items-center gap-6 text-center px-4 py-12 lg:py-24">
        <h1
          className="
            font-black t-t-1"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 via-white-500 to-point-1">
            {t('domain')}
          </span>
        </h1>
        <h2 className="t-t-2 max-w-md dark:text-white">{t('title')}</h2>
        <p className="t-d-1 t-basic-3">{t('subTitle')}</p>
      </div>

      <div className="flex justify-center">
        <Image priority src={logoIcon} alt={'logo'} width={250} height={250} />
      </div>
    </>
  );
}
