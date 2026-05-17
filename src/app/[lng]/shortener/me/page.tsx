import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ListChecks } from 'lucide-react';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import ServiceInfoNotice from '@components/complex/Service/ServiceInfoNotice';
import { getTranslations } from '~/app/i18n';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';
import MyShortUrlsTable from './MyShortUrlsTable';

export const dynamic = 'force-dynamic';

export default async function MyShortUrlsPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const cookieStore = await cookies();
  // 인증 가드: refresh_token + user_info 중 하나라도 없으면 로그인 페이지로 보낸다.
  // (access_token 은 미들웨어가 갱신할 수 있으므로 단독 기준으로 쓰지 않는다.)
  const refreshToken = cookieStore.get('refresh_token')?.value;
  const userInfo = cookieStore.get('user_info')?.value;
  if (!refreshToken || !userInfo) {
    redirect(`/${language}/auth/login?redirect_uri=/${language}/shortener/me`);
  }

  const { t } = await getTranslations(language, 'shortener');

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-2 pb-24 pt-3 sm:px-3 md:px-4">
      <ServicePageHeader
        title={t('me.title')}
        description={t('me.description')}
        badge={t('me.headerBadge')}
      />

      <ServiceInfoNotice icon={<ListChecks className="h-5 w-5" />}>{t('intro')}</ServiceInfoNotice>

      <MyShortUrlsTable lng={language} />
    </div>
  );
}
