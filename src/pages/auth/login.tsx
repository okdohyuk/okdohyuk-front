import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import MobileScreenWarpper from '@components/Complex/Layouts/MobileScreenWarpper';
import googleSignInButton from '../../../public/icons/signin/web_neutral_rd_na.svg';
import Image from 'next/image';
import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Opengraph from '@components/Basic/Opengraph';
import Link from '@components/Basic/Link';
import { authApi } from '@api';

type Login = (accessToken: string, redirectUri: string) => void;

function LoginPage() {
  const { t } = useTranslation('login');
  const { asPath, push } = useRouter();
  const [loginButtonDisabled, setLoginButtonDisabled] = React.useState<boolean>(true);

  useEffect(() => {
    const hash = asPath.split('#')[1];
    if (!hash) return setLoginButtonDisabled(false);
    const params = new URLSearchParams(hash);
    const paramsState = params.get('state');
    const accessToken = params.get('access_token');
    const state = localStorage.getItem('login_state');
    if (!paramsState || !accessToken || state !== paramsState) return setLoginButtonDisabled(false);
    const redirectUri = localStorage.getItem('redirect_uri');
    login(accessToken, redirectUri || '/');
  }, []);

  const login: Login = (accessToken, redirectUri) => {
    authApi
      .postAuthGoogle(accessToken, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(({ data }) => {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user_id', data.user_id);
        push(redirectUri);
      })
      .catch(() => {
        push('/auth/login');
      })
      .finally(() => {
        localStorage.removeItem('redirect_uri');
        localStorage.removeItem('login_state');
      });
  };

  const handleLogin = async () => {
    const oauthUrl = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const scope = process.env.NEXT_PUBLIC_GOOGLE_SCOPE;
    const state = Math.random().toString(36).substring(2, 15);
    const url = `${oauthUrl}?scope=${scope}&include_granted_scopes=true&response_type=token
    &state=${state}&redirect_uri=${window.location.origin}/auth/login&client_id=${clientId}`;
    localStorage.setItem('login_state', state);
    window.location.href = url;
  };

  return (
    <>
      <Opengraph
        title={t('openGraph.title')}
        ogTitle={t('openGraph.ogTitle')}
        description={t('openGraph.description')}
      />
      <MobileScreenWarpper>
        <h1 className={'t-t-1 t-basic-1 mb-4'}>{t('title')}</h1>
        <div className="t-d-1 t-basic-1 mb-16">{t('openGraph.description')}</div>
        <button
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
      </MobileScreenWarpper>
    </>
  );
}

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale as string, ['common', 'login'])),
  },
});

export default LoginPage;
