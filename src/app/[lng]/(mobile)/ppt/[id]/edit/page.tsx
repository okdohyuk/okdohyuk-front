import React from 'react';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from '~/app/i18n';
import { translationsMetadata } from '@libs/server/customMetadata';
import { Language } from '~/app/i18n/settings';
import { buildLoginUrl } from '@utils/loginRedirect';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import { getServiceCategoryBadge } from '@assets/datas/serviceCategories';
import PptEditorClient from '../../components/PptEditorClient';

type EditPptPageProps = { params: Promise<{ lng: string; id: string }> };

export const dynamic = 'force-dynamic';

export const generateMetadata = async ({ params }: EditPptPageProps) =>
  translationsMetadata({ params, ns: 'ppt' });

export default async function EditPptPage({ params }: EditPptPageProps) {
  const { lng, id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();
  const language = lng as Language;
  const cookieStore = await cookies();
  if (!cookieStore.get('refresh_token')?.value || !cookieStore.get('user_info')?.value) {
    redirect(buildLoginUrl(`/${language}/auth/login`, `/${language}/ppt/${id}/edit`));
  }
  const { t } = await getTranslations(language, 'ppt');

  return (
    <div className="space-y-4">
      <ServicePageHeader
        title={t('edit')}
        description={t('description')}
        badge={getServiceCategoryBadge(language, '/ppt')}
      />
      <PptEditorClient lng={language} id={id} />
    </div>
  );
}
