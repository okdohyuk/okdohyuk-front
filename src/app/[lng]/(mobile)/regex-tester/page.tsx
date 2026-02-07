import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import { H1, Text } from '@components/basic/Text';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import RegexTesterClient from '~/app/[lng]/(mobile)/regex-tester/components/RegexTesterClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'regex-tester' });

export default async function RegexTesterPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'regex-tester');

  return (
    <div className="space-y-4">
      <H1 className="sr-only">{t('title')}</H1>
      <Text className="sr-only">{t('description')}</Text>
      <ServicePageHeader title={t('title')} description={t('description')} badge="Pattern Lab" />
      <RegexTesterClient lng={language} />
    </div>
  );
}
