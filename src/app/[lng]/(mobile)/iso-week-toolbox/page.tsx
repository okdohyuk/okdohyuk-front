import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import { H1, Text } from '@components/basic/Text';
import IsoWeekToolboxClient from '~/app/[lng]/(mobile)/iso-week-toolbox/components/IsoWeekToolboxClient';
import Tag from '@components/basic/Tag';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'iso-week-toolbox' });

export default async function IsoWeekToolboxPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'iso-week-toolbox');

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <H1>{t('title')}</H1>
          <Tag tag={t('badge')} />
        </div>
        <Text variant="d2" color="basic-4">
          {t('description')}
        </Text>
      </header>
      <IsoWeekToolboxClient lng={language} />
    </div>
  );
}
