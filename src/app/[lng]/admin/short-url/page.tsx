import React from 'react';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';
import ShortUrlAdminPageImpl from './impl';

export default async function ShortUrlAdminPage({ params }: LanguageParams) {
  const { lng } = await params;

  return <ShortUrlAdminPageImpl lng={lng as Language} />;
}
