import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import { H1, Text } from '@components/basic/Text';
import { SERVICE_PANEL } from '@components/complex/Service/interactiveStyles';
import Base64FileEncoderClient from './components/Base64FileEncoderClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'base64-file' });

export default async function Base64FilePage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'base64-file');

  return (
    <div className="space-y-4">
      <header className={SERVICE_PANEL}>
        <div className="space-y-2 px-5 py-6 md:px-7 md:py-7">
          <H1 className="text-zinc-900 dark:text-zinc-50">{t('title')}</H1>
          <Text className="text-sm text-zinc-600 dark:text-zinc-300">{t('description')}</Text>
        </div>
      </header>
      <Base64FileEncoderClient lng={language} />
    </div>
  );
}
