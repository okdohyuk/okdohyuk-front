import React from 'react';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { getTranslations } from '~/app/i18n';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import { H1, Text } from '@components/basic/Text';
import HydrationToolkitClient from '~/app/[lng]/(mobile)/hydration-toolkit/components/HydrationToolkitClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'hydration-toolkit' });

export default async function HydrationToolkitPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, 'hydration-toolkit');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <H1>{t('title')}</H1>
        <Text className="text-sm text-gray-600 dark:text-gray-300">{t('description')}</Text>
      </div>
      <HydrationToolkitClient lng={language} />
    </div>
  );
}
