'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, RotateCcw } from 'lucide-react';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface ReadingTimeClientProps {
  lng: Language;
}

const splitWords = (value: string) =>
  value.trim().replace(/[_-]+/g, ' ').split(/\s+/).filter(Boolean);

const toTitleCase = (value: string) =>
  splitWords(value)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

const getReadingSeconds = (wordCount: number, wpm: number) => {
  if (!wordCount) return 0;
  return Math.ceil((wordCount / wpm) * 60);
};

const formatDuration = (
  seconds: number,
  t: (key: string, options?: Record<string, unknown>) => string,
) => {
  if (!seconds) return t('time.instant');
  const minutes = Math.floor(seconds / 60);
  const remainSeconds = seconds % 60;
  if (minutes === 0) return t('time.seconds', { seconds: remainSeconds });
  if (remainSeconds === 0) return t('time.minutes', { minutes });
  return t('time.minutesSeconds', { minutes, seconds: remainSeconds });
};

export default function ReadingTimeClient({ lng }: ReadingTimeClientProps) {
  const { t } = useTranslation(lng, 'reading-time');
  const [value, setValue] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const wordList = useMemo(() => splitWords(value), [value]);
  const wordCount = wordList.length;

  const summary = useMemo(() => {
    const characters = value.length;
    const charactersNoSpace = value.replace(/\s/g, '').length;
    const bytes = typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(value).length : 0;

    return [
      { key: 'stats.words', value: wordCount.toLocaleString() },
      { key: 'stats.characters', value: characters.toLocaleString() },
      { key: 'stats.charactersNoSpace', value: charactersNoSpace.toLocaleString() },
      { key: 'stats.bytes', value: bytes.toLocaleString() },
    ];
  }, [value, wordCount]);

  const readingTimes = useMemo(() => {
    const slow = getReadingSeconds(wordCount, 180);
    const average = getReadingSeconds(wordCount, 240);
    const fast = getReadingSeconds(wordCount, 300);

    return [
      { key: 'speed.slow', value: formatDuration(slow, t), wpm: 180 },
      { key: 'speed.average', value: formatDuration(average, t), wpm: 240 },
      { key: 'speed.fast', value: formatDuration(fast, t), wpm: 300 },
    ];
  }, [wordCount, t]);

  const preview = useMemo(() => toTitleCase(value), [value]);

  const handleClear = () => {
    setValue('');
    setCopiedKey(null);
  };

  const handleCopy = async (text: string, key: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="reading-time-input"
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
          id="reading-time-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t('placeholder')}
          rows={8}
          className="resize-none"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {summary.map((item) => (
          <div
            key={item.key}
            className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-1 p-4')}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t(item.key)}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t('section.readingTime')}
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {readingTimes.map((item) => (
            <div
              key={item.key}
              className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-1 p-4')}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {t(item.key, { wpm: item.wpm })}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-3 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="reading-time-preview"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.preview')}
          </label>
          <Button
            type="button"
            onClick={() => handleCopy(preview, 'preview')}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!preview}
          >
            {copiedKey === 'preview' ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copiedKey === 'preview' ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
        <Textarea
          id="reading-time-preview"
          value={preview}
          readOnly
          rows={4}
          placeholder={t('empty')}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('previewHelper')}</p>
      </div>
    </div>
  );
}
