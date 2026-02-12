import React from 'react';
import SleepCyclePlanner from '~/app/[lng]/(mobile)/sleep-cycle/components/SleepCyclePlanner';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'sleep-cycle' });

export default async function SleepCyclePage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, 'sleep-cycle');

  return <SleepCyclePlanner lng={language} title={t('title')} description={t('description')} />;
}
