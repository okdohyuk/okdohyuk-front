'use client';

import React, { useMemo, useState } from 'react';
import { Textarea } from '@components/basic/Textarea';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface TextAnalyzerClientProps {
  lng: Language;
}

const WORDS_PER_MINUTE = 200;

export default function TextAnalyzerClient({ lng }: TextAnalyzerClientProps) {
  const { t } = useTranslation(lng, 'text-analyzer');
  const [value, setValue] = useState('');

  const stats = useMemo(() => {
    const trimmed = value.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const characters = value.length;
    const charactersNoSpaces = value.replace(/\s/g, '').length;
    const sentences = trimmed ? trimmed.split(/[.!?]+/).filter(Boolean).length : 0;
    const paragraphs = value
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean).length;
    const readingMinutes = words === 0 ? 0 : Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));

    const formatNumber = (number: number) => new Intl.NumberFormat().format(number);

    return [
      { label: t('stats.words'), value: formatNumber(words) },
      { label: t('stats.characters'), value: formatNumber(characters) },
      { label: t('stats.charactersNoSpaces'), value: formatNumber(charactersNoSpaces) },
      { label: t('stats.sentences'), value: formatNumber(sentences) },
      { label: t('stats.paragraphs'), value: formatNumber(paragraphs) },
      {
        label: t('stats.readingTime'),
        value: `${formatNumber(readingMinutes)}${t('stats.minutes')}`,
      },
    ];
  }, [t, value]);

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="text-analyzer-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.input')}
        </label>
        <Textarea
          id="text-analyzer-input"
          className="min-h-[180px]"
          placeholder={t('placeholder')}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {t('label.stats')}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">{t('statsHint')}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-zinc-200/70 bg-white/80 p-3 text-sm shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/70"
            >
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
