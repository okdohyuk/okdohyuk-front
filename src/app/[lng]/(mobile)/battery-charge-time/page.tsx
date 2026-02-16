import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import { H1, Text } from '@components/basic/Text';
import BatteryChargeTimeClient from '~/app/[lng]/(mobile)/battery-charge-time/components/BatteryChargeTimeClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'battery-charge-time' });

export default async function BatteryChargeTimePage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'battery-charge-time');

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <H1>{t('title')}</H1>
        <Text className="text-sm text-gray-400 md:text-base">{t('description')}</Text>
      </header>
      <BatteryChargeTimeClient lng={language} />
    </div>
  );
}
