import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import { H1, Text } from '@components/basic/Text';
import BudgetPlannerClient from '~/app/[lng]/(mobile)/budget-planner/components/BudgetPlannerClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'budget-planner' });

export default async function BudgetPlannerPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'budget-planner');

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <H1 className="t-basic-1">{t('title')}</H1>
        <Text variant="d2" className="t-basic-3">
          {t('description')}
        </Text>
      </header>
      <BudgetPlannerClient lng={language} />
    </div>
  );
}
