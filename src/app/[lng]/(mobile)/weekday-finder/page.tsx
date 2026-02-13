import React from 'react';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { getTranslations } from '~/app/i18n';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import WeekdayFinderClient from './components/WeekdayFinderClient';

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'weekday-finder' });

export default async function WeekdayFinderPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, 'weekday-finder');

  return (
    <div className="space-y-4">
      <ServicePageHeader
        title={t('title')}
        description={t('description')}
        badge="Calendar Helper"
      />
      <WeekdayFinderClient lng={language} />
    </div>
  );
}
