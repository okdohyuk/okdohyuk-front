import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ListChecks } from 'lucide-react';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import ServiceInfoNotice from '@components/complex/Service/ServiceInfoNotice';
import { getTranslations } from '~/app/i18n';
import { buildLoginUrl } from '@utils/loginRedirect';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';
import SolveAttemptsClient from './SolveAttemptsClient';

export const dynamic = 'force-dynamic';

export default async function SolveMyAttemptsPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  // 기록(내 시도 목록)은 로그인 필요. refresh_token + user_info 중 하나라도 없으면 로그인으로.
  // (access_token 은 미들웨어가 갱신할 수 있어 단독 기준 X.)
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;
  const userInfo = cookieStore.get('user_info')?.value;
  if (!refreshToken || !userInfo) {
    redirect(buildLoginUrl(`/${language}/auth/login`, `/${language}/solve/me`));
  }

  const { t } = await getTranslations(language, 'solve');

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-2 pb-24 pt-3 sm:px-3 md:px-4">
      <ServicePageHeader
        title={t('me.title')}
        description={t('me.description')}
        badge={t('me.headerBadge')}
      />

      <ServiceInfoNotice icon={<ListChecks className="h-5 w-5" />}>{t('intro')}</ServiceInfoNotice>

      <SolveAttemptsClient lng={language} />
    </div>
  );
}
