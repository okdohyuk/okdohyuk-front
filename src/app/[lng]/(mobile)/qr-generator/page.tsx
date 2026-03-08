import React from 'react';
import QrGenerator from '~/app/[lng]/(mobile)/qr-generator/components/QrGenerator';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { getTranslations } from '~/app/i18n';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import { getServiceCategoryBadge } from '@assets/datas/serviceCategories';

export const generateMetadata: GenerateMetadata = async ({ params }) => {
  return translationsMetadata({
    params,
    ns: 'qr-generator',
  });
};

export default async function QrGeneratorPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, 'qr-generator');
  const badge = getServiceCategoryBadge(language, '/qr-generator');

  return (
    <div className="space-y-4">
      <ServicePageHeader title={t('title')} description={t('description')} badge={badge} />
      <QrGenerator lng={language} />
    </div>
  );
}
