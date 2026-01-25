import React from 'react';
import Image from 'next/legacy/image';
import { notFound } from 'next/navigation';
import { Viewport } from 'next';
import InstallApp from '@components/complex/InstallApp';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { useTranslation as getServerTranslation } from '~/app/i18n';
import { languages } from '~/app/i18n/settings';
import { stringToLanguage } from '@utils/localeUtil';
import { LanguageParams } from '~/app/[lng]/layout';
import { H1, H2, Text } from '@components/basic/Text';
import logoIcon from '../../../public/logo.svg';

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

      <div className="flex flex-col items-center gap-6 px-4 py-12 text-center lg:py-24">
        <H1 className="font-black">
          <span className="bg-gradient-to-r from-zinc-500 via-white-500 to-point-1 bg-clip-text text-transparent">
            {t('domain')}
          </span>
        </H1>
        <H2 className="max-w-md t-basic-0">{t('title')}</H2>
        <Text variant="d1" color="basic-3">
          {t('subTitle')}
        </Text>
      </div>

      <div className="flex justify-center">
        <Image priority src={logoIcon} alt="logo" width={250} height={250} />
      </div>
    </>
  );
}
