import React from 'react';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { getTranslations } from '~/app/i18n';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import { H1, Text } from '@components/basic/Text';
import TextToolkit, {
  TextToolkitLabels,
} from '~/app/[lng]/(mobile)/text-toolkit/components/TextToolkit';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'text-toolkit' });

export default async function TextToolkitPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, 'text-toolkit');

  const labels: TextToolkitLabels = {
    stats: {
      title: t('stats.title'),
      description: t('stats.description'),
      inputLabel: t('stats.inputLabel'),
      placeholder: t('stats.placeholder'),
      metrics: {
        characters: t('stats.metrics.characters'),
        words: t('stats.metrics.words'),
        lines: t('stats.metrics.lines'),
        sentences: t('stats.metrics.sentences'),
      },
    },
    caseConverter: {
      title: t('case.title'),
      description: t('case.description'),
      inputLabel: t('case.inputLabel'),
      placeholder: t('case.placeholder'),
      outputLabel: t('case.outputLabel'),
      empty: t('case.empty'),
      actions: {
        upper: t('case.actions.upper'),
        lower: t('case.actions.lower'),
        title: t('case.actions.title'),
        sentence: t('case.actions.sentence'),
        swap: t('case.actions.swap'),
      },
      copy: t('case.copy'),
      copied: t('case.copied'),
    },
    listCleaner: {
      title: t('list.title'),
      description: t('list.description'),
      inputLabel: t('list.inputLabel'),
      placeholder: t('list.placeholder'),
      outputLabel: t('list.outputLabel'),
      empty: t('list.empty'),
      options: {
        trim: t('list.options.trim'),
        dedupe: t('list.options.dedupe'),
        sort: t('list.options.sort'),
        reverse: t('list.options.reverse'),
      },
    },
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <H1 className="t-basic-1">{t('title')}</H1>
        <Text variant="d2" color="basic-5">
          {t('description')}
        </Text>
      </header>
      <TextToolkit labels={labels} />
    </div>
  );
}
