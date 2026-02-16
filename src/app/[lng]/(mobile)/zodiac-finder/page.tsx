import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import { H1, Text } from '@components/basic/Text';
import ZodiacFinderClient from './components/ZodiacFinderClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'zodiac-finder' });

export default async function ZodiacFinderPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'zodiac-finder');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <H1>{t('title')}</H1>
        <Text className="text-gray-600 dark:text-gray-300">{t('description')}</Text>
      </div>
      <ZodiacFinderClient lng={language} />
    </div>
  );
}
