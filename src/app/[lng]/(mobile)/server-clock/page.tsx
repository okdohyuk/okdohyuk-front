import React from 'react';
import Clock from './components/Clock';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'server-clock' });

export default async function ServerClockPage({ params }: LanguageParams) {
  const { lng } = await params;

  return <Clock lng={lng} />;
}
