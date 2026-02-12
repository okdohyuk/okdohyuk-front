import React from 'react';
import FuelCostCalculator from '~/app/[lng]/(mobile)/fuel-cost/components/FuelCostCalculator';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { getTranslations } from '~/app/i18n';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'fuel-cost' });

export default async function FuelCostPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, 'fuel-cost');

  return (
    <div className="space-y-4">
      <ServicePageHeader title={t('title')} description={t('description')} badge={t('badge')} />
      <FuelCostCalculator lng={language} />
    </div>
  );
}
