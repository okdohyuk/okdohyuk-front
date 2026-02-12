'use client';

import React, { useMemo, useState } from 'react';
import { TFunction } from 'i18next';
import { Textarea } from '@components/basic/Textarea';
import { cn } from '@utils/cn';

interface TextStatsPanelProps {
  t: TFunction<'text-toolkit', undefined>;
}

export default function TextStatsPanel({ t }: TextStatsPanelProps) {
  const [value, setValue] = useState('');

  const stats = useMemo(() => {
    const trimmed = value.trim();
    const characters = value.length;
    const charactersNoSpace = value.replace(/\s/g, '').length;
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const lines = value ? value.split(/\r?\n/).length : 0;

    return {
      characters,
      charactersNoSpace,
      words,
      lines,
    };
  }, [value]);

  const statItems = [
    { label: t('stats.label.characters'), value: stats.characters },
    { label: t('stats.label.charactersNoSpace'), value: stats.charactersNoSpace },
    { label: t('stats.label.words'), value: stats.words },
    { label: t('stats.label.lines'), value: stats.lines },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {t('stats.title')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('stats.description')}</p>
      </div>
      <div className="space-y-2">
        <label
          htmlFor="text-toolkit-stats"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('stats.label.input')}
        </label>
        <Textarea
          id="text-toolkit-stats"
          className="min-h-[140px]"
          placeholder={t('stats.placeholder')}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {statItems.map((item) => (
          <div
            key={item.label}
            className={cn(
              'rounded-xl border border-gray-200/70 bg-white/70 px-4 py-3 text-sm shadow-sm',
              'dark:border-gray-700/70 dark:bg-gray-900/60',
            )}
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
