import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import BingeCalculatorClient from '~/app/[lng]/(mobile)/binge-calculator/components/BingeCalculatorClient';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import { H1, Text } from '@components/basic/Text';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'binge-calculator' });

export default async function BingeCalculatorPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'binge-calculator');

  return (
    <div className="space-y-4">
      <H1 className="sr-only">{t('title')}</H1>
      <ServicePageHeader title={t('title')} description={t('description')} badge="Series Planner" />
      <Text className="text-sm text-zinc-600 dark:text-zinc-300">{t('subtitle')}</Text>
      <BingeCalculatorClient lng={language} />
    </div>
  );
}
