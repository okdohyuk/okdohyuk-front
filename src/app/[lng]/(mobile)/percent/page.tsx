import React from 'react';
import PercentCalculatorCard from '~/app/[lng]/(mobile)/percent/components/PercentCalculatorCard';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { PercentCalculators } from '@stores/PercentStore/type';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import { H1 } from '@components/basic/Text';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

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
      <H1 className="mb-4 t-basic-1">{t('title')}</H1>
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
