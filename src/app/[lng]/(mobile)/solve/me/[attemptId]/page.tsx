import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { buildLoginUrl } from '@utils/loginRedirect';
import { Language } from '~/app/i18n/settings';
import AttemptResultClient from './AttemptResultClient';

export const dynamic = 'force-dynamic';

type AttemptResultParams = {
  params: Promise<{ lng: string; attemptId: string }>;
};

// 완료된 시도의 결과를 다시 보는 읽기 전용 페이지. 기록(me) 하위라 로그인 필수 —
// refresh_token + user_info 중 하나라도 없으면 로그인으로 (me/page.tsx 와 동일 기준).
export default async function SolveAttemptResultPage({ params }: AttemptResultParams) {
  const { lng, attemptId } = await params;
  const language = lng as Language;

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;
  const userInfo = cookieStore.get('user_info')?.value;
  if (!refreshToken || !userInfo) {
    redirect(buildLoginUrl(`/${language}/auth/login`, `/${language}/solve/me/${attemptId}`));
  }

  const parsedId = Number(attemptId);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    redirect(`/${language}/solve/me`);
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-2 pb-24 pt-3 sm:px-3 md:px-4">
      <AttemptResultClient lng={language} attemptId={parsedId} />
    </div>
  );
}
