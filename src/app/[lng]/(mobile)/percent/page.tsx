import React from 'react';
import PercentCalculatorCard from '~/app/[lng]/(mobile)/percent/components/PercentCalculatorCard';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { PercentCalculators } from '@stores/PercentStore/type';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'percent' });

export default async function PercentPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'percent');

  const calculators: (keyof PercentCalculators)[] = [
    'percentageOfTotal',
    'partOfTotal',
    'findPercentage',
    'percentageUpDown',
    'findPercentageValue',
  ];

  return (
    <>
      <h1 className="t-t-1 t-basic-1 mb-4">{t('title')}</h1>
      <section className="w-full space-y-4">
        {calculators.map((name) => (
          <PercentCalculatorCard
            key={name}
            calculatorName={name}
            placeholder={t(`${name}.placeholder`, { returnObjects: true })}
            text={t(`${name}.text`, { returnObjects: true })}
            lng={language}
          />
        ))}
      </section>
    </>
  );
}
