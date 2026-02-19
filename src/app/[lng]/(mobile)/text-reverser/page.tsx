import React from 'react';
import TextReverserClient from '~/app/[lng]/(mobile)/text-reverser/components/TextReverserClient';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { getTranslations } from '~/app/i18n';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';

export const generateMetadata: GenerateMetadata = async ({ params }) => {
  return translationsMetadata({
    params,
    ns: 'text-reverser',
  });
};

export default async function TextReverserPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, 'text-reverser');

  return (
    <div className="space-y-4">
      <ServicePageHeader title={t('title')} description={t('description')} badge="Text Utility" />
      <TextReverserClient lng={language} />
    </div>
  );
}
