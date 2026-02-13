'use client';

import React, { useMemo, useState } from 'react';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import { RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import ServiceInfoNotice from '@components/complex/Service/ServiceInfoNotice';

interface WordCounterClientProps {
  lng: Language;
}

export default function WordCounterClient({ lng }: WordCounterClientProps) {
  const { t } = useTranslation(lng, 'word-counter');
  const [value, setValue] = useState('');

  const stats = useMemo(() => {
    if (!value) {
      return {
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        lines: 0,
      };
    }

    const words = value.trim() ? value.trim().split(/\s+/).filter(Boolean).length : 0;
    const characters = value.length;
    const charactersNoSpaces = value.replace(/\s/g, '').length;
    const lines = value.split(/\r\n|\r|\n/).length;

    return {
      words,
      characters,
      charactersNoSpaces,
      lines,
    };
  }, [value]);

  const handleReset = () => {
    setValue('');
  };

  const statItems = [
    { key: 'words', value: stats.words, label: t('stats.words') },
    { key: 'characters', value: stats.characters, label: t('stats.characters') },
    {
      key: 'charactersNoSpaces',
      value: stats.charactersNoSpaces,
      label: t('stats.charactersNoSpaces'),
    },
    { key: 'lines', value: stats.lines, label: t('stats.lines') },
  ];

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="word-counter-input"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.input')}
          </label>
          <Button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!value}
          >
            <RotateCcw size={14} />
            {t('button.reset')}
          </Button>
        </div>
        <Textarea
          id="word-counter-input"
          className="min-h-[160px] text-sm"
          placeholder={t('placeholder')}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </div>

      <ServiceInfoNotice icon={<Sparkles className="h-5 w-5" />}>{t('notice')}</ServiceInfoNotice>

      <div className="grid gap-3 sm:grid-cols-2">
        {statItems.map((item) => (
          <div
            key={item.key}
            className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'flex flex-col gap-2 p-4')}
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {item.label}
            </span>
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
