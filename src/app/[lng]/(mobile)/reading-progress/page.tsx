import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import ReadingProgressClient from '~/app/[lng]/(mobile)/reading-progress/components/ReadingProgressClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'reading-progress' });

export default async function ReadingProgressPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'reading-progress');

  return (
    <div className="space-y-4">
      <ServicePageHeader
        title={t('title')}
        description={t('description')}
        badge="Reading Planner"
      />
      <ReadingProgressClient lng={language} />
    </div>
  );
}
