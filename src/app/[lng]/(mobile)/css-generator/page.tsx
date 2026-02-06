import React from 'react';
import CssGenerator from '~/app/[lng]/(mobile)/css-generator/components/CssGenerator';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { useTranslation as getServerTranslation } from '~/app/i18n';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';

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
    <div className="space-y-4">
      <ServicePageHeader
        title={t('title')}
        description={t('description')}
        badge="Design Playground"
      />
      <CssGenerator lng={language} />
    </div>
  );
}
