import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import SleepDebtClient from './components/SleepDebtClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'sleep-debt' });

export default async function SleepDebtPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  await getTranslations(language, 'sleep-debt');

  return <SleepDebtClient lng={language} />;
}
