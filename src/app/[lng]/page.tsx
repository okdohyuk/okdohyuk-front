import React from 'react';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Viewport } from 'next';
import InstallApp from '@components/complex/InstallApp';
import FavoritesHome from '@components/complex/Home/FavoritesHome';
import LandingHome from '@components/complex/Home/Landing/LandingHome';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { getLandingCopy } from '@libs/server/landingCopy';
import { useTranslation as getServerTranslation } from '~/app/i18n';
import { stringToLanguage } from '@utils/localeUtil';
import { LanguageParams } from '~/app/[lng]/layout';

// 로그인 분기가 쿠키(서버) 기준이므로 홈은 정적 생성 없이 요청 시 렌더링한다.
export const dynamic = 'force-dynamic';

export const generateMetadata: GenerateMetadata = async ({ params }) => {
  const { lng } = await params;
  return translationsMetadata({
    params,
    ns: stringToLanguage(lng) === null ? 'notFound' : 'index',
  });
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#AA90FA',
};

export default async function Home({ params }: LanguageParams) {
  const { lng } = await params;
  const language = stringToLanguage(lng);

  // redirect to notfound
  if (!language) notFound();
  const { t } = await getServerTranslation(language, 'index');

  // 로그인 분기를 서버(쿠키)에서 확정한다. 예전처럼 랜딩을 먼저 그린 뒤 클라이언트에서
  // 즐겨찾기 홈으로 교체하면 로그인 사용자에게 매번 랜딩이 번쩍이고, 스크롤/포커스도
  // 어긋난다. 판정 기준은 인증 가드(quiz/me)와 동일: refresh_token + user_info.
  // 비로그인(봇 포함)은 그대로 SEO 대상 랜딩을 받는다.
  const cookieStore = await cookies();
  const loggedIn =
    !!cookieStore.get('refresh_token')?.value && !!cookieStore.get('user_info')?.value;

  if (loggedIn) {
    return (
      <>
        <InstallApp text={t('downloads')} />
        <FavoritesHome lng={language} />
      </>
    );
  }

  const copy = await getLandingCopy(language);
  return (
    <>
      <InstallApp text={t('downloads')} />
      <LandingHome lng={language} copy={copy} />
    </>
  );
}
