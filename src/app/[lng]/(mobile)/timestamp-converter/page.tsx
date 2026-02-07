import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import { H1, Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { SERVICE_PANEL } from '@components/complex/Service/interactiveStyles';
import TimestampConverterClient from '~/app/[lng]/(mobile)/timestamp-converter/components/TimestampConverterClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'timestamp-converter' });

export default async function TimestampConverterPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, 'timestamp-converter');

  return (
    <div className="space-y-4">
      <header
        className={cn(
          SERVICE_PANEL,
          'relative overflow-hidden px-5 py-6 md:px-7 md:py-7',
        )}
      >
        <div className="pointer-events-none absolute -left-12 top-0 h-28 w-28 rounded-full bg-point-2/30 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-6 h-20 w-20 rounded-full bg-violet-400/20 blur-3xl" />
        <Text
          className="relative z-10 mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-point-1"
          color="basic-4"
        >
          Time Utility
        </Text>
        <H1 className="relative z-10 text-zinc-900 dark:text-zinc-50">{t('title')}</H1>
        <Text asChild className="relative z-10 mt-2 max-w-3xl text-sm leading-relaxed">
          <p>{t('description')}</p>
        </Text>
      </header>
      <TimestampConverterClient lng={language} />
    </div>
  );
}
