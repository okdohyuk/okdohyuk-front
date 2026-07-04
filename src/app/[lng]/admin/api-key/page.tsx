import React from 'react';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';
import ApiKeyManagePageImpl from './impl';

export default async function AdminApiKeyPage({ params }: LanguageParams) {
  const { lng } = await params;

  return <ApiKeyManagePageImpl lng={lng as Language} />;
}
