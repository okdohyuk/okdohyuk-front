import React from 'react';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import Clock from './components/Clock';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'server-clock' });

export default async function ServerClockPage({ params }: LanguageParams) {
  const { lng } = await params;

  return <Clock lng={lng as Language} />;
}
