'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Textarea } from '@components/basic/Textarea';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface SentenceAnalyzerClientProps {
  lng: Language;
}

const sentenceSplitRegex = /[.!?。！？]+/;

export default function SentenceAnalyzerClient({ lng }: SentenceAnalyzerClientProps) {
  const { t } = useTranslation(lng, 'sentence-analyzer');
  const [value, setValue] = useState('');

  const stats = useMemo(() => {
    const trimmed = value.trim();
    const characters = value.length;
    const charactersNoSpaces = value.replace(/\s/g, '').length;
    const lines = value ? value.split(/\r?\n/).length : 0;

    const sentences = trimmed
      ? trimmed
          .split(sentenceSplitRegex)
          .map((part) => part.trim())
          .filter(Boolean).length
      : 0;

    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const bytes = value ? new TextEncoder().encode(value).length : 0;

    const averageWords = sentences ? Number((words / sentences).toFixed(1)) : 0;
    const averageChars = sentences ? Number((characters / sentences).toFixed(1)) : 0;

    return {
      characters,
      charactersNoSpaces,
      lines,
      sentences,
      words,
      bytes,
      averageWords,
      averageChars,
    };
  }, [value]);

  const statItems = [
    { key: 'sentences', value: stats.sentences },
    { key: 'words', value: stats.words },
    { key: 'characters', value: stats.characters },
    { key: 'charactersNoSpaces', value: stats.charactersNoSpaces },
    { key: 'lines', value: stats.lines },
    { key: 'bytes', value: stats.bytes },
    { key: 'averageWords', value: stats.averageWords },
    { key: 'averageChars', value: stats.averageChars },
  ];

  return (
    <div className="w-full space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label htmlFor="sentence-analyzer-input" className="text-sm font-medium t-basic-1">
          {t('label.input')}
        </label>
        <Textarea
          id="sentence-analyzer-input"
          className="h-40 resize-none"
          placeholder={t('placeholder')}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold t-basic-1">{t('label.summary')}</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">{t('summaryHint')}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {statItems.map((item) => (
            <div
              key={item.key}
              className={cn(
                SERVICE_PANEL_SOFT,
                SERVICE_CARD_INTERACTIVE,
                'flex items-center justify-between gap-3 rounded-2xl px-4 py-3',
              )}
            >
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                {t(`stats.${item.key}`)}
              </span>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">{item.value}</span>
            </div>
          ))}
        </div>
        {!value ? <p className="text-xs text-gray-400 dark:text-gray-500">{t('empty')}</p> : null}
      </section>
    </div>
  );
}
