import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { translationsMetadata } from '@libs/server/customMetadata';
import { Language } from '~/app/i18n/settings';
import { buildLoginUrl } from '@utils/loginRedirect';
import PptRemoteClient from './PptRemoteClient';

type PptRemotePageProps = { params: Promise<{ lng: string }> };

export const dynamic = 'force-dynamic';

export const generateMetadata = async ({ params }: PptRemotePageProps) =>
  translationsMetadata({ params, ns: 'ppt' });

export default async function PptRemotePage({ params }: PptRemotePageProps) {
  const { lng } = await params;
  const language = lng as Language;
  const cookieStore = await cookies();
  if (!cookieStore.get('refresh_token')?.value || !cookieStore.get('user_info')?.value) {
    redirect(buildLoginUrl(`/${language}/auth/login`, `/${language}/ppt/remote`));
  }
  return <PptRemoteClient lng={language} />;
}
