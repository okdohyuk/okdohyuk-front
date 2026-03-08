import React from 'react';
import AnniversaryCounterClient from '~/app/[lng]/(mobile)/anniversary-counter/components/AnniversaryCounterClient';
import { H1, Text } from '@components/basic/Text';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'anniversary-counter' });

export default async function AnniversaryCounterPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, 'anniversary-counter');

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <H1>{t('title')}</H1>
        <Text className="text-sm text-gray-600 dark:text-gray-300">{t('description')}</Text>
      </div>
      <AnniversaryCounterClient lng={language} />
    </div>
  );
}
