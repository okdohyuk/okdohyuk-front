import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import { H1, Text } from '@components/basic/Text';
import UuidGeneratorClient from '~/app/[lng]/(mobile)/uuid-generator/components/UuidGeneratorClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'uuid-generator' });

export default async function UuidGeneratorPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'uuid-generator');

  return (
    <>
      <H1 className="mb-2 t-basic-1">{t('title')}</H1>
      <Text className="mb-6 t-basic-1/60">{t('description')}</Text>
      <UuidGeneratorClient lng={language} />
    </>
  );
}
