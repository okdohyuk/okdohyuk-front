'use client';

import React, { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface TextCounterClientProps {
  lng: Language;
}

const countWords = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
};

const countLines = (value: string) => {
  if (!value) return 0;
  return value.split(/\r\n|\r|\n/).length;
};

export default function TextCounterClient({ lng }: TextCounterClientProps) {
  const { t } = useTranslation(lng, 'text-counter');
  const [value, setValue] = useState('');

  const stats = useMemo(() => {
    const characters = value.length;
    const charactersNoSpace = value.replace(/\s/g, '').length;
    const words = countWords(value);
    const lines = countLines(value);
    const bytes = typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(value).length : 0;

    return [
      { key: 'stats.characters', value: characters },
      { key: 'stats.charactersNoSpace', value: charactersNoSpace },
      { key: 'stats.words', value: words },
      { key: 'stats.lines', value: lines },
      { key: 'stats.bytes', value: bytes },
    ] as const;
  }, [value]);

  const handleClear = () => setValue('');

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="text-counter-input"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.input')}
          </label>
          <Button
            type="button"
            onClick={handleClear}
            disabled={!value}
            className="flex items-center gap-2 px-3 py-1 text-xs"
          >
            <RotateCcw size={14} />
            {t('button.clear')}
          </Button>
        </div>
        <Textarea
          id="text-counter-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t('placeholder')}
          rows={8}
          className="resize-none"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-1 p-4')}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t(stat.key)}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
