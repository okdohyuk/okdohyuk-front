import React from 'react';
import QrGenerator from '~/app/[lng]/(mobile)/qr-generator/components/QrGenerator';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { getTranslations } from '~/app/i18n';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';

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

  return (
    <div className="space-y-4">
      <ServicePageHeader title={t('title')} description={t('description')} badge="QR Utility" />
      <QrGenerator lng={language} />
    </div>
  );
}
