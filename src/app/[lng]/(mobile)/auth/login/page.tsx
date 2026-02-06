'use client';

import { useRouter } from 'next/navigation';
import React, { use, useCallback, useEffect } from 'react';
import googleSignInButton from '~/../public/icons/signin/web_neutral_rd_na.svg';
import Image from 'next/legacy/image';
import Cookies from 'js-cookie';
import { ShieldCheck } from 'lucide-react';

import Link from '~/components/basic/Link';
import { authApi, userApi } from '@api';
import useStore from '@hooks/useStore';
import { useTranslation } from '~/app/i18n/client';
import { LanguageParams } from '~/app/[lng]/layout';
import UserTokenUtil from '~/utils/userTokenUtil';
import { Language } from '~/app/i18n/settings';
import { Text } from '@components/basic/Text';
import { Button } from '@components/basic/Button';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import ServiceInfoNotice from '@components/complex/Service/ServiceInfoNotice';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';

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
    <div className="space-y-4">
      <ServicePageHeader title={t('title')} />

      <ServiceInfoNotice icon={<ShieldCheck className="h-5 w-5" />}>
        {t('openGraph.description')}
      </ServiceInfoNotice>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4 md:p-5')}>
        <Button
          type="button"
          className="mb-4 w-full space-x-2 border border-zinc-200 bg-white hover:bg-zinc-200 dark:border-zinc-700 disabled:hover:bg-white"
          onClick={handleLogin}
          disabled={loginButtonDisabled}
        >
          <Image priority src={googleSignInButton} alt="Google sign in button" />
          <Text variant="d1" className="text-[#757575] dark:text-[#757575]">
            {t('login.google')}
          </Text>
        </Button>

        <div className="flex items-center justify-center gap-4">
          <Link href="/terms">
            <Text
              variant="c1"
              className="t-basic-1 decoration-1 underline-offset-2 transition-colors hover:text-blue-500 hover:underline"
            >
              {t('terms')}
            </Text>
          </Link>
          <div className="h-3 w-[1px] bg-zinc-300 dark:bg-zinc-600" />
          <Link href="/privacy">
            <Text
              variant="c1"
              className="t-basic-1 decoration-1 underline-offset-2 transition-colors hover:text-blue-500 hover:underline"
            >
              {t('privacy-policy')}
            </Text>
          </Link>
        </div>
      </section>
    </div>
  );
}
