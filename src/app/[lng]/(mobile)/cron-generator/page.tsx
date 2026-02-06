import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import CronGeneratorClient from '~/app/[lng]/(mobile)/cron-generator/components/CronGeneratorClient';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'cron-generator' });

export default async function CronGeneratorPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'cron-generator');

  return (
    <div className="space-y-4">
      <ServicePageHeader
        title={t('title')}
        description={t('description')}
        badge="Automation Tool"
      />
      <CronGeneratorClient lng={language} />
    </div>
  );
}
