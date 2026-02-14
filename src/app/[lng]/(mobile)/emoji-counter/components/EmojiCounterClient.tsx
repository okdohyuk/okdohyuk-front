'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, Eraser, Sparkles } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { Textarea } from '@components/basic/Textarea';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface EmojiCounterClientProps {
  lng: Language;
}

const getEmojiCount = (value: string) => {
  if (!value) return 0;
  const matches = value.match(/\p{Extended_Pictographic}/gu);
  return matches ? matches.length : 0;
};

export default function EmojiCounterClient({ lng }: EmojiCounterClientProps) {
  const { t } = useTranslation(lng, 'emoji-counter');
  const [value, setValue] = useState('');
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const totalChars = value.length;
    const charsWithoutSpace = value.replace(/\s/g, '').length;
    const trimmed = value.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const lines = value ? value.split(/\r?\n/).length : 0;
    const emojis = getEmojiCount(value);

    return {
      totalChars,
      charsWithoutSpace,
      words,
      lines,
      emojis,
    };
  }, [value]);

  const summaryText = useMemo(() => {
    return [
      `${t('summary.totalChars')}: ${stats.totalChars}`,
      `${t('summary.charsWithoutSpace')}: ${stats.charsWithoutSpace}`,
      `${t('summary.words')}: ${stats.words}`,
      `${t('summary.lines')}: ${stats.lines}`,
      `${t('summary.emojis')}: ${stats.emojis}`,
    ].join('\n');
  }, [stats, t]);

  const handleCopySummary = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy summary:', error);
    }
  };

  const handleClear = () => {
    setValue('');
    setCopied(false);
  };

  const handleFillExample = () => {
    setValue(t('example'));
    setCopied(false);
  };

  return (
    <div className="w-full space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="emoji-counter-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.input')}
        </label>
        <Textarea
          id="emoji-counter-input"
          className="min-h-[160px]"
          placeholder={t('placeholder')}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setCopied(false);
          }}
        />
        <Text variant="c1" color="basic-5">
          {t('helper')}
        </Text>
        <div className="flex flex-wrap gap-2">
          <Button type="button" className="gap-2 px-3 py-2 text-xs" onClick={handleCopySummary}>
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copySummary')}
          </Button>
          <Button type="button" className="gap-2 px-3 py-2 text-xs" onClick={handleClear}>
            <Eraser size={16} />
            {t('button.clear')}
          </Button>
          <Button type="button" className="gap-2 px-3 py-2 text-xs" onClick={handleFillExample}>
            <Sparkles size={16} />
            {t('button.fillExample')}
          </Button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'grid gap-3 p-4 sm:grid-cols-2')}>
        {[
          { key: 'totalChars', label: t('summary.totalChars'), value: stats.totalChars },
          {
            key: 'charsWithoutSpace',
            label: t('summary.charsWithoutSpace'),
            value: stats.charsWithoutSpace,
          },
          { key: 'words', label: t('summary.words'), value: stats.words },
          { key: 'lines', label: t('summary.lines'), value: stats.lines },
          { key: 'emojis', label: t('summary.emojis'), value: stats.emojis },
        ].map((item) => (
          <div
            key={item.key}
            className={cn(
              SERVICE_CARD_INTERACTIVE,
              'rounded-2xl border border-zinc-200/70 bg-white/80 p-4 dark:border-zinc-700/70 dark:bg-zinc-900/80',
            )}
          >
            <Text variant="c1" color="basic-5">
              {item.label}
            </Text>
            <Text variant="t2" className="mt-2">
              {item.value}
            </Text>
          </div>
        ))}
      </section>

      <Text variant="c1" color="basic-5">
        {t('note')}
      </Text>
    </div>
  );
}
