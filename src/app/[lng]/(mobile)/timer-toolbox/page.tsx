import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import { H1, Text } from '@components/basic/Text';
import TimerToolboxClient from '~/app/[lng]/(mobile)/timer-toolbox/components/TimerToolboxClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'timer-toolbox' });

export default async function TimerToolboxPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'timer-toolbox');

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <H1>{t('title')}</H1>
        <Text color="basic-4">{t('description')}</Text>
      </header>
      <TimerToolboxClient lng={language} />
    </div>
  );
}
