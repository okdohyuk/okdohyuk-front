import React from 'react';
import GuestbookClient from '~/app/[lng]/(mobile)/guestbook/components/GuestbookClient';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { getTranslations } from '~/app/i18n';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import { getServiceCategoryBadge } from '@assets/datas/serviceCategories';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'guestbook' });

export default async function GuestbookPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, 'guestbook');
  const badge = getServiceCategoryBadge(language, '/guestbook');

  return (
    <div className="space-y-4">
      <ServicePageHeader title={t('title')} description={t('description')} badge={badge} />
      <GuestbookClient lng={language} />
    </div>
  );
}
