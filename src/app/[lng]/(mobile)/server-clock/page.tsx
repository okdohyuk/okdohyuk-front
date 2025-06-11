import React from 'react';
import { Language } from '~/app/i18n/settings';
import Clock from './components/Clock';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';

interface ServerClockPageProps {
  params: { lng: Language };
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'server-clock' });

export default async function ServerClockPage({ params }: ServerClockPageProps) {
  const lng = await params.lng;
  // const { t } = await getTranslations(lng, 'server-clock');

  return <Clock lng={lng} />;
}
