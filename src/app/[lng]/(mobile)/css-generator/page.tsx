import React from 'react';
import CssGenerator from '~/app/[lng]/(mobile)/css-generator/components/CssGenerator';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { useTranslation as getServerTranslation } from '~/app/i18n';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';

export const generateMetadata: GenerateMetadata = async ({ params }) => {
  return translationsMetadata({
    params,
    ns: 'css-generator',
  });
};

export default async function CssGeneratorPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getServerTranslation(language, 'css-generator');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('description')}</p>
      </div>
      <CssGenerator lng={language} />
    </div>
  );
}
