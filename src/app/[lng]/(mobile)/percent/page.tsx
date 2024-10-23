import React from 'react';
import PercentCalculatorCard from '@components/complex/Card/PercentCalculatorCard';
import { useTranslation } from '~/app/i18n';
import { translationsMetadata, GenerateMetadata } from '@libs/server/customMetadata';
import { PercentCalculators } from '@stores/PercentStore/type';
import { LanguageParams } from '~/app/[lng]/layout';

export const generateMetadata: GenerateMetadata = ({ params }) =>
  translationsMetadata({ params, ns: 'percent' });

export default async function PercentPage({ params: { lng } }: LanguageParams) {
  const { t } = await useTranslation(lng, 'percent');

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
            lng={lng}
          />
        ))}
      </section>
    </>
  );
}
