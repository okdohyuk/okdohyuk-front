import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import WordFrequencyClient from '~/app/[lng]/(mobile)/word-frequency/components/WordFrequencyClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'word-frequency' });

export default async function WordFrequencyPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'word-frequency');

  return (
    <div className="space-y-4">
      <ServicePageHeader title={t('title')} description={t('description')} badge="Text Insights" />
      <WordFrequencyClient lng={language} />
    </div>
  );
}
