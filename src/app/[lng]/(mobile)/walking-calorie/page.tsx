import React from 'react';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { getTranslations } from '~/app/i18n';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import { H1, Text } from '@components/basic/Text';
import WalkingCalorieCalculator from './components/WalkingCalorieCalculator';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'walking-calorie' });

export default async function WalkingCaloriePage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, 'walking-calorie');

  const i18n = {
    title: t('title'),
    description: t('description'),
    modeLabel: t('mode.label'),
    modes: {
      distance: t('mode.distance'),
      steps: t('mode.steps'),
    },
    inputs: {
      distance: t('inputs.distance'),
      steps: t('inputs.steps'),
      stride: t('inputs.stride'),
      weight: t('inputs.weight'),
    },
    placeholders: {
      distance: t('placeholders.distance'),
      steps: t('placeholders.steps'),
      stride: t('placeholders.stride'),
      weight: t('placeholders.weight'),
    },
    helper: {
      stride: t('helper.stride'),
      weight: t('helper.weight'),
    },
    actions: {
      reset: t('actions.reset'),
      copy: t('actions.copy'),
      copied: t('actions.copied'),
    },
    results: {
      distance: t('results.distance'),
      calorie: t('results.calorie'),
      formula: t('results.formula'),
      empty: t('results.empty'),
    },
    notes: {
      defaultStride: t('notes.defaultStride'),
      defaultWeight: t('notes.defaultWeight'),
    },
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <H1>{i18n.title}</H1>
        <Text variant="d2" color="basic-4">
          {i18n.description}
        </Text>
      </header>
      <WalkingCalorieCalculator i18n={i18n} />
    </div>
  );
}
