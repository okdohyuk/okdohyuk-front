import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sanitizeRedirectUri } from '@utils/loginRedirect';
import { Language } from '~/app/i18n/settings';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';

type LoginPageParams = {
  params: Promise<{ lng: string }>;
  searchParams: Promise<{ redirect_uri?: string }>;
};

// 이미 로그인된 사용자가 로그인 페이지에 오면(가드의 낡은 리다이렉트, 새로고침, 북마크)
// 로그인 화면을 보여주지 않고 서버에서 바로 복귀시킨다. OAuth 콜백(구글 → /auth/login#hash)
// 시점에는 아직 쿠키가 없으므로 이 가드에 걸리지 않고 클라이언트 처리로 넘어간다.
export default async function LoginPage({ params, searchParams }: LoginPageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { redirect_uri: redirectUri } = await searchParams;

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;
  const userInfo = cookieStore.get('user_info')?.value;
  if (refreshToken && userInfo) {
    redirect(sanitizeRedirectUri(redirectUri) ?? `/${language}`);
  }

  return <LoginClient lng={language} />;
}
