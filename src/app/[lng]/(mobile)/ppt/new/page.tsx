import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from '~/app/i18n';
import { translationsMetadata } from '@libs/server/customMetadata';
import { Language } from '~/app/i18n/settings';
import { buildLoginUrl } from '@utils/loginRedirect';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import { getServiceCategoryBadge } from '@assets/datas/serviceCategories';
import PptEditorClient from '../components/PptEditorClient';

type NewPptPageProps = { params: Promise<{ lng: string }> };

export const dynamic = 'force-dynamic';

export const generateMetadata = async ({ params }: NewPptPageProps) =>
  translationsMetadata({ params, ns: 'ppt' });

export default async function NewPptPage({ params }: NewPptPageProps) {
  const { lng } = await params;
  const language = lng as Language;
  const cookieStore = await cookies();
  if (!cookieStore.get('refresh_token')?.value || !cookieStore.get('user_info')?.value) {
    redirect(buildLoginUrl(`/${language}/auth/login`, `/${language}/ppt/new`));
  }
  const { t } = await getTranslations(language, 'ppt');

  return (
    <div className="space-y-4">
      <ServicePageHeader
        title={t('new')}
        description={t('description')}
        badge={getServiceCategoryBadge(language, '/ppt')}
      />
      <PptEditorClient lng={language} />
    </div>
  );
}
