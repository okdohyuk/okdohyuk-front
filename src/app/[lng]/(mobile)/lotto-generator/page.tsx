import React from 'react';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { getTranslations } from '~/app/i18n';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import { H1, Text } from '@components/basic/Text';
import LottoGenerator from '~/app/[lng]/(mobile)/lotto-generator/components/LottoGenerator';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'lotto-generator' });

export default async function LottoGeneratorPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, 'lotto-generator');

  const strings = {
    settingsTitle: t('settingsTitle'),
    resultsTitle: t('resultsTitle'),
    helper: t('helper'),
    labels: {
      minNumber: t('labels.minNumber'),
      maxNumber: t('labels.maxNumber'),
      picksPerTicket: t('labels.picksPerTicket'),
      ticketCount: t('labels.ticketCount'),
      includeBonus: t('labels.includeBonus'),
    },
    placeholders: {
      minNumber: t('placeholders.minNumber'),
      maxNumber: t('placeholders.maxNumber'),
      picksPerTicket: t('placeholders.picksPerTicket'),
      ticketCount: t('placeholders.ticketCount'),
    },
    buttons: {
      generate: t('buttons.generate'),
      clear: t('buttons.clear'),
      copy: t('buttons.copy'),
      reset: t('buttons.reset'),
    },
    status: {
      copied: t('status.copied'),
      empty: t('status.empty'),
    },
    validation: {
      range: t('validation.range'),
      picks: t('validation.picks'),
      tickets: t('validation.tickets'),
    },
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <H1 className="text-balance text-zinc-900 dark:text-zinc-100">{t('title')}</H1>
        <Text className="text-sm text-zinc-600 dark:text-zinc-300">{t('description')}</Text>
      </header>
      <LottoGenerator strings={strings} />
    </div>
  );
}
