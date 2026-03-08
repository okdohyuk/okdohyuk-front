import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import { getServiceCategoryBadge } from '@assets/datas/serviceCategories';
import JsonYamlConverterClient from '~/app/[lng]/(mobile)/json-yaml-converter/components/JsonYamlConverterClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'json-yaml-converter' });

export default async function JsonYamlConverterPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'json-yaml-converter');
  const badge = getServiceCategoryBadge(language, '/json-yaml-converter');

  return (
    <div className="space-y-4">
      <ServicePageHeader title={t('title')} description={t('description')} badge={badge} />
      <JsonYamlConverterClient lng={language} />
    </div>
  );
}
