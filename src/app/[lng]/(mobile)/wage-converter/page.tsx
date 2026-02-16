import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import { H1, Text } from '@components/basic/Text';
import WageConverterClient from '~/app/[lng]/(mobile)/wage-converter/components/WageConverterClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'wage-converter' });

export default async function WageConverterPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'wage-converter');

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <H1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t('title')}</H1>
        <Text className="text-sm" color="basic-5">
          {t('description')}
        </Text>
      </header>
      <WageConverterClient lng={language} />
    </div>
  );
}
