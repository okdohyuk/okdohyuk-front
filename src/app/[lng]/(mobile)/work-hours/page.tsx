import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import WorkHoursClient from '~/app/[lng]/(mobile)/work-hours/components/WorkHoursClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'work-hours' });

export default async function WorkHoursPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'work-hours');

  return (
    <div className="space-y-4">
      <WorkHoursClient lng={language} title={t('title')} description={t('description')} />
    </div>
  );
}
