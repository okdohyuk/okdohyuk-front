import React from 'react';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { translationsMetadata } from '@libs/server/customMetadata';
import { Language } from '~/app/i18n/settings';
import { buildLoginUrl } from '@utils/loginRedirect';
import PptPresentClient from './PptPresentClient';

type PptPresentPageProps = { params: Promise<{ lng: string; id: string }> };

export const dynamic = 'force-dynamic';

export const generateMetadata = async ({ params }: PptPresentPageProps) =>
  translationsMetadata({ params, ns: 'ppt' });

export default async function PptPresentPage({ params }: PptPresentPageProps) {
  const { lng, id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();
  const language = lng as Language;
  const cookieStore = await cookies();
  if (!cookieStore.get('refresh_token')?.value || !cookieStore.get('user_info')?.value) {
    redirect(buildLoginUrl(`/${language}/auth/login`, `/${language}/ppt/present/${id}`));
  }
  return <PptPresentClient lng={language} presentationId={id} />;
}
