import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import JwtDecoderClient from '~/app/[lng]/(mobile)/jwt-decoder/components/JwtDecoderClient';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'jwt-decoder' });

export default async function JwtDecoderPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'jwt-decoder');

  return (
    <div className="space-y-4">
      <ServicePageHeader
        title={t('title')}
        description={t('description')}
        badge="Token Inspector"
      />
      <JwtDecoderClient lng={language} />
    </div>
  );
}
