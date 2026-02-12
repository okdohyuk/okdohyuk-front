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

interface WordCounterClientProps {
  lng: Language;
}

const WORDS_PER_MINUTE = 200;

export default function WordCounterClient({ lng }: WordCounterClientProps) {
  const { t } = useTranslation(lng, 'word-counter');
  const [value, setValue] = useState('');

  const stats = useMemo(() => {
    const normalized = value.replace(/\r\n/g, '\n');
    const trimmed = normalized.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const characters = normalized.length;
    const charactersNoSpaces = normalized.replace(/\s/g, '').length;
    const lines = normalized ? normalized.split('\n').length : 0;
    const readingTime = words === 0 ? 0 : Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));

    return {
      words,
      characters,
      charactersNoSpaces,
      lines,
      readingTime,
    };
  }, [value]);

  const statItems = [
    { label: t('stats.words'), value: stats.words },
    { label: t('stats.characters'), value: stats.characters },
    { label: t('stats.charactersNoSpaces'), value: stats.charactersNoSpaces },
    { label: t('stats.lines'), value: stats.lines },
    { label: t('stats.readingTime'), value: `${stats.readingTime} ${t('units.min')}` },
  ];

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="word-counter-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.input')}
        </label>
        <Textarea
          id="word-counter-input"
          rows={8}
          placeholder={t('placeholder')}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {statItems.map((item) => (
          <div
            key={item.label}
            className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-2 p-4')}
          >
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{item.label}</p>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
