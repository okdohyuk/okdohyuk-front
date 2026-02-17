import React from 'react';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import LeaveBalanceClient from './components/LeaveBalanceClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'leave-balance' });

export default async function LeaveBalancePage({ params }: LanguageParams) {
  const { lng } = await params;

  return <LeaveBalanceClient lng={lng as Language} />;
}
