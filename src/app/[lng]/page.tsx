import React from 'react';
import { cookies } from 'next/headers';
import { languages } from '~/app/i18n/settings';
import { translationsMetadata, GenerateMetadata } from '@libs/server/customMetadata';
import { notFound } from 'next/navigation';
import { stringToLanguage } from '@utils/localeUtil';
import { LanguageParams } from '~/app/[lng]/layout';
import Intro from '@components/complex/Home/Intro';
import Dashboard from '@components/complex/Home/Dashboard';

export const generateMetadata: GenerateMetadata = async ({ params }) => {
  const { lng } = await params;
  return translationsMetadata({
    params,
    ns: stringToLanguage(lng) === null ? 'notFound' : 'index',
  });
};

export default async function Home({ params }: LanguageParams) {
  const { lng } = await params;

  if (languages.indexOf(lng) < 0) notFound();

  const cookieStore = cookies();
  const userCookie = cookieStore.get('user_info');
  let user: any = null;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie.value);
    } catch {
      user = null;
    }
  }

  return user ? <Dashboard lng={lng} user={user} /> : <Intro lng={lng} />;
}
