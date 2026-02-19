import React from 'react';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import PassphraseGenerator from './components/PassphraseGenerator';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'passphrase-generator' });

export default async function PassphraseGeneratorPage({ params }: LanguageParams) {
  const { lng } = await params;

  return <PassphraseGenerator lng={lng as Language} />;
}
