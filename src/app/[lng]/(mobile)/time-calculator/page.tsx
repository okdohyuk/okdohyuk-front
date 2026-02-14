import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import { H1, Text } from '@components/basic/Text';
import TimeCalculatorClient from '~/app/[lng]/(mobile)/time-calculator/components/TimeCalculatorClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'time-calculator' });

export default async function TimeCalculatorPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, 'time-calculator');

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <H1 className="text-gray-900 dark:text-gray-100">{t('title')}</H1>
        <Text className="text-sm text-gray-600 dark:text-gray-300">{t('description')}</Text>
      </header>
      <TimeCalculatorClient lng={language} />
    </div>
  );
}
