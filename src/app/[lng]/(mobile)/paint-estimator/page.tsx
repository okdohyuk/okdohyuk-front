import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import PaintEstimatorClient from '~/app/[lng]/(mobile)/paint-estimator/components/PaintEstimatorClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = ({ params }) =>
  translationsMetadata({ params, ns: 'paint-estimator' });

export default async function PaintEstimatorPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, 'paint-estimator');

  return (
    <div className="space-y-4">
      <ServicePageHeader title={t('title')} description={t('description')} badge={t('badge')} />
      <PaintEstimatorClient lng={language} />
    </div>
  );
}
