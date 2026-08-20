import React, { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import { buildLoginUrl } from '@utils/loginRedirect';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import { getServiceCategoryBadge } from '@assets/datas/serviceCategories';
import PptWorkspaceClient from './components/PptWorkspaceClient';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'ppt' });

export default async function PptPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const cookieStore = await cookies();
  if (!cookieStore.get('refresh_token')?.value || !cookieStore.get('user_info')?.value) {
    redirect(buildLoginUrl(`/${language}/auth/login`, `/${language}/ppt`));
  }

  const { t } = await getTranslations(language, 'ppt');
  return (
    <div className="space-y-4">
      <ServicePageHeader
        title={t('title')}
        description={t('description')}
        badge={getServiceCategoryBadge(language, '/ppt')}
      />
      <Suspense fallback={null}>
        <PptWorkspaceClient lng={language} />
      </Suspense>
    </div>
  );
}
