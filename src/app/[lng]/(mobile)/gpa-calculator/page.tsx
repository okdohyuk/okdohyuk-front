import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import { H1, Text } from '@components/basic/Text';
import GpaCalculatorClient from '~/app/[lng]/(mobile)/gpa-calculator/components/GpaCalculatorClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'gpa-calculator' });

export default async function GpaCalculatorPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'gpa-calculator');

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <H1>{t('title')}</H1>
        <Text variant="d3" color="basic-4">
          {t('description')}
        </Text>
      </header>
      <GpaCalculatorClient lng={language} />
    </div>
  );
}
