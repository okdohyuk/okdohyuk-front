import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import ServiceInfoNotice from '@components/complex/Service/ServiceInfoNotice';
import { Bus } from 'lucide-react';
import CommuteToolkit from '~/app/[lng]/(mobile)/commute-helper/components/CommuteToolkit';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'commute-helper' });

export default async function CommuteHelperPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, 'commute-helper');

  return (
    <div className="space-y-4">
      <ServicePageHeader title={t('title')} description={t('description')} badge={t('badge')} />

      <ServiceInfoNotice icon={<Bus className="h-5 w-5" />}>{t('helper')}</ServiceInfoNotice>

      <CommuteToolkit lng={language} />
    </div>
  );
}
