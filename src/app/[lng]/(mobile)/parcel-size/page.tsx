import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import ParcelSizeClient from '~/app/[lng]/(mobile)/parcel-size/components/ParcelSizeClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = ({ params }) =>
  translationsMetadata({ params, ns: 'parcel-size' });

export default async function ParcelSizePage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, 'parcel-size');

  return (
    <div className="space-y-4">
      <ServicePageHeader title={t('title')} description={t('description')} badge={t('badge')} />
      <ParcelSizeClient lng={language} />
    </div>
  );
}
