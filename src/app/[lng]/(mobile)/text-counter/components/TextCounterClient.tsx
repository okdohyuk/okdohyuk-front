'use client';

import React, { useMemo, useState } from 'react';
import { Textarea } from '@components/basic/Textarea';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface TextCounterClientProps {
  lng: Language;
}

type StatItem = {
  key: string;
  label: string;
  value: number;
};

export default function TextCounterClient({ lng }: TextCounterClientProps) {
  const { t } = useTranslation(lng, 'text-counter');
  const [value, setValue] = useState('');

  const stats = useMemo(() => {
    const trimmed = value.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const lines = value ? value.split(/\r?\n/).length : 0;
    const characters = value.length;
    const charactersNoSpace = value.replace(/\s/g, '').length;
    const bytes = typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(value).length : 0;

    return {
      characters,
      charactersNoSpace,
      words,
      lines,
      bytes,
    };
  }, [value]);

  const items: StatItem[] = [
    { key: 'characters', label: t('metrics.characters'), value: stats.characters },
    {
      key: 'charactersNoSpace',
      label: t('metrics.charactersNoSpace'),
      value: stats.charactersNoSpace,
    },
    { key: 'words', label: t('metrics.words'), value: stats.words },
    { key: 'lines', label: t('metrics.lines'), value: stats.lines },
    { key: 'bytes', label: t('metrics.bytes'), value: stats.bytes },
  ];

  return (
    <div className="w-full space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="text-counter-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.input')}
        </label>
        <Textarea
          id="text-counter-input"
          placeholder={t('placeholder')}
          value={value}
          rows={6}
          onChange={(event) => setValue(event.target.value)}
          className="min-h-[160px] text-sm"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {t('label.stats')}
          </h2>
          {!value ? (
            <span className="text-xs text-gray-400 dark:text-gray-500">{t('empty')}</span>
          ) : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.key}
              className={cn(
                SERVICE_CARD_INTERACTIVE,
                'rounded-xl border border-gray-100 bg-white/80 p-3 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900/60',
              )}
            >
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
