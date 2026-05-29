import React from 'react';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { getTranslations } from '~/app/i18n';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import { getServiceCategoryBadge } from '@assets/datas/serviceCategories';
import CopykillerClient from './components/CopykillerClient';

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'copykiller' });

export default async function CopykillerPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, 'copykiller');
  const badge = getServiceCategoryBadge(language, '/anti-copykiller');

  return (
    <div className="w-full space-y-4 px-2 pb-24 pt-3 sm:px-3 md:px-4">
      <ServicePageHeader title={t('title')} description={t('description')} badge={badge} />
      <CopykillerClient lng={language} />
    </div>
  );
}
