import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import BreathingTimerClient from '~/app/[lng]/(mobile)/breathing-timer/components/BreathingTimerClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'breathing-timer' });

export default async function BreathingTimerPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  await getTranslations(language, 'breathing-timer');

  return (
    <div className="space-y-4">
      <BreathingTimerClient lng={language} />
    </div>
  );
}
