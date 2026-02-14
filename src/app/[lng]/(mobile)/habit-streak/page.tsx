import React from 'react';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { getTranslations } from '~/app/i18n';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import HabitStreakClient from '~/app/[lng]/(mobile)/habit-streak/components/HabitStreakClient';
import { H1, Text } from '@components/basic/Text';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'habit-streak' });

export default async function HabitStreakPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, 'habit-streak');

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <H1 className="t-basic-1">{t('title')}</H1>
        <Text className="t-d-2 text-gray-600 dark:text-gray-300">{t('description')}</Text>
      </div>
      <HabitStreakClient lng={language} />
    </div>
  );
}
