import React from 'react';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import RandomPicker from './components/RandomPicker';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'random-picker' });

export default async function RandomPickerPage({ params }: LanguageParams) {
  const { lng } = await params;

  return <RandomPicker lng={lng as Language} />;
}
