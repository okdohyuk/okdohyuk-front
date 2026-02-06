import React from 'react';
import CronGenerator from '@components/complex/tools/CronGenerator';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { useTranslation as getServerTranslation } from '~/app/i18n';
import { stringToLanguage } from '@utils/localeUtil';
import { LanguageParams } from '~/app/[lng]/layout';

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({
    params,
    ns: 'cron-generator',
  });

export default async function CronGeneratorPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = stringToLanguage(lng);
  const { t } = await getServerTranslation(language, 'cron-generator');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('description')}</p>
      </div>
      <CronGenerator lng={language} />
    </div>
  );
}
