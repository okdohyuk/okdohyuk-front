import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import NetworkCalculatorClient from '~/app/[lng]/(mobile)/network-calculator/components/NetworkCalculatorClient';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import { getServiceCategoryBadge } from '@assets/datas/serviceCategories';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'network-calculator' });

export default async function NetworkCalculatorPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'network-calculator');
  const badge = getServiceCategoryBadge(language, '/network-calculator');

  return (
    <div className="space-y-4">
      <ServicePageHeader title={t('title')} description={t('description')} badge={badge} />
      <NetworkCalculatorClient lng={language} />
    </div>
  );
}
