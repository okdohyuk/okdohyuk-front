import React from 'react';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import LadderGame from './components/LadderGame';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'ladder-game' });

export default async function LadderGamePage({ params }: LanguageParams) {
  const { lng } = await params;

  return <LadderGame lng={lng as Language} />;
}
