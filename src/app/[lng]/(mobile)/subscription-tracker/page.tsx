import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import SubscriptionTrackerClient from '~/app/[lng]/(mobile)/subscription-tracker/components/SubscriptionTrackerClient';
import { H1, Text } from '@components/basic/Text';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'subscription-tracker' });

export default async function SubscriptionTrackerPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, 'subscription-tracker');

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <H1>{t('title')}</H1>
        <Text variant="d2" color="basic-4">
          {t('description')}
        </Text>
      </header>
      <SubscriptionTrackerClient lng={language} />
    </div>
  );
}
