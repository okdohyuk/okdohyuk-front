import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import BillSplitterClient from '~/app/[lng]/(mobile)/bill-splitter/components/BillSplitterClient';
import { H1, Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { SERVICE_PANEL } from '@components/complex/Service/interactiveStyles';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'bill-splitter' });

export default async function BillSplitterPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'bill-splitter');

  return (
    <div className="space-y-4">
      <header
        className={cn(
          SERVICE_PANEL,
          'relative overflow-hidden px-5 py-6 md:px-7 md:py-7 space-y-2',
        )}
      >
        <Text variant="c1" className="uppercase tracking-[0.2em] text-point-1">
          {t('badge')}
        </Text>
        <H1 className="text-zinc-900 dark:text-zinc-50">{t('title')}</H1>
        <Text variant="d2" color="basic-4" className="max-w-3xl">
          {t('description')}
        </Text>
      </header>
      <BillSplitterClient lng={language} />
    </div>
  );
}
