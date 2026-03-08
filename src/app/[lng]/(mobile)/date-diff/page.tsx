import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import { H1, Text } from '@components/basic/Text';
import DateDiffClient from './components/DateDiffClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'date-diff' });

export default async function DateDiffPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'date-diff');

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <H1>{t('title')}</H1>
        <Text className="text-sm text-gray-600 dark:text-gray-300">{t('description')}</Text>
      </header>
      <DateDiffClient
        labels={{
          helper: t('helper'),
          startLabel: t('label.start'),
          endLabel: t('label.end'),
          includeEnd: t('label.includeEnd'),
          today: t('button.today'),
          swap: t('button.swap'),
          reset: t('button.reset'),
          copy: t('button.copy'),
          copied: t('button.copied'),
          resultTitle: t('result.title'),
          totalDays: t('result.totalDays'),
          weeks: t('result.weeks'),
          weekdays: t('result.weekdays'),
          weekends: t('result.weekends'),
          empty: t('result.empty'),
          invalidRange: t('result.invalidRange'),
          dayUnit: t('result.unit.day'),
          weekUnit: t('result.unit.week'),
          summaryTitle: t('result.summaryTitle'),
        }}
      />
    </div>
  );
}
