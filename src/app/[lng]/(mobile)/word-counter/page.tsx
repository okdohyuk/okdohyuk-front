import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import WordCounterClient from '~/app/[lng]/(mobile)/word-counter/components/WordCounterClient';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'word-counter' });

export default async function WordCounterPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'word-counter');

  return (
    <div className="space-y-4">
      <ServicePageHeader
        title={t('title')}
        description={t('openGraph.description')}
        badge="Writing Helper"
      />
      <WordCounterClient lng={language} />
    </div>
  );
}
