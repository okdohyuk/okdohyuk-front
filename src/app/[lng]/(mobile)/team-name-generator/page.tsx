import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import TeamNameGeneratorClient from '~/app/[lng]/(mobile)/team-name-generator/components/TeamNameGeneratorClient';
import { H1, Text } from '@components/basic/Text';
import { SERVICE_PAGE_SURFACE } from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'team-name-generator' });

export default async function TeamNameGeneratorPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, 'team-name-generator');

  return (
    <div className="space-y-4">
      <section className={cn(SERVICE_PAGE_SURFACE, 'space-y-2')}>
        <H1>{t('title')}</H1>
        <Text className="text-sm text-gray-600 dark:text-gray-300">{t('description')}</Text>
      </section>
      <TeamNameGeneratorClient lng={language} />
    </div>
  );
}
