'use client';

import { useRouter } from 'next/navigation';
import React, { use, useCallback, useEffect } from 'react';
import googleSignInButton from '~/../public/icons/signin/web_neutral_rd_na.svg';
import Image from 'next/legacy/image';
import Cookies from 'js-cookie';

import Link from '~/components/basic/Link';
import { authApi, userApi } from '@api';
import useStore from '@hooks/useStore';
import { useTranslation } from '~/app/i18n/client';
import { LanguageParams } from '~/app/[lng]/layout';
import UserTokenUtil from '~/utils/userTokenUtil';
import { Language } from '~/app/i18n/settings';

type LoginHandler = (accessToken: string, redirectUri: string) => void;

export default function LoginPage({ params }: LanguageParams) {
  const { lng } = use(params);
  const language = lng as Language;

  const { t } = useTranslation(language, 'login');
  const { push } = useRouter();
  const [loginButtonDisabled, setLoginButtonDisabled] = React.useState<boolean>(true);
  const { setUser } = useStore('userStore');

  const login = useCallback<LoginHandler>(
    (accessToken, redirectUri) => {
      authApi
        .postAuthGoogle(`Bearer ${accessToken}`)
        .then(({ data: { access_token, refresh_token, user_id } }) => {
          userApi.getUserUserId(`Bearer ${access_token}`, user_id).then(({ data }) => {
            setUser(data);

            // 토큰과 사용자 정보를 클라이언트 쿠키에 직접 저장
            UserTokenUtil.setAccessToken(access_token);
            UserTokenUtil.setRefreshToken(refresh_token);
            UserTokenUtil.setUserInfo(data);
            push(redirectUri);
          });
        })
        .catch(() => {
          push('/auth/login');
        })
        .finally(() => {
          Cookies.remove('redirect_uri');
          Cookies.remove('login_state');
        });
    },
    [push, setUser],
  );

  useEffect(() => {
    const hashFragment = window.location.hash.split('#')[1];
    if (!hashFragment) {
      setLoginButtonDisabled(false);
      return;
    }
    const searchParams = new URLSearchParams(hashFragment);
    const paramsState = searchParams.get('state');
    const accessToken = searchParams.get('access_token');
    const state = Cookies.get('login_state');
    if (!paramsState || !accessToken || state !== paramsState) {
      setLoginButtonDisabled(false);
      return;
    }

    const redirectUri = Cookies.get('redirect_uri');
    login(accessToken, redirectUri || '/');
  }, [login]);

  const handleLogin = async () => {
    const oauthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const scope = process.env.NEXT_PUBLIC_GOOGLE_SCOPE;
    const state = Math.random().toString(36).substring(2, 15);
    const url = `${oauthUrl}?scope=${scope}&include_granted_scopes=true&response_type=token&state=${state}&redirect_uri=${window.location.origin}/auth/login&client_id=${clientId}`;
    Cookies.set('login_state', state);
    window.location.href = url;
  };

  return (
    <>
      <h1 className="t-t-1 t-basic-1 mb-4">{t('title')}</h1>
      <div className="t-d-1 t-basic-1 mb-16">{t('openGraph.description')}</div>
      <button
        type="button"
        className="button w-full disabled:opacity-50 disabled:hover:bg-white bg-white hover:bg-zinc-200 space-x-2 mb-4"
        onClick={handleLogin}
        disabled={loginButtonDisabled}
      >
        <Image priority src={googleSignInButton} alt="Google sign in button" />
        <div className="t-d-1 text-[#757575]">{t('login.google')}</div>
      </button>
      <Link href="https://privacy-policy.okdohyuk.dev" hasTargetBlank>
        <div className="t-c-1 t-basic-1">{t('privacy-policy')}</div>
      </Link>
    </>
  );
}
