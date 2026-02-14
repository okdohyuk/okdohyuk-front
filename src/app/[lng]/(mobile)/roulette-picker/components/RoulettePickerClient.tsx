'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, Sparkles } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Textarea } from '@components/basic/Textarea';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

const EXAMPLE_ITEMS = ['치킨', '피자', '분식', '샐러드', '스시'];
const MAX_HISTORY = 5;

interface RoulettePickerClientProps {
  lng: Language;
}

const parseItems = (value: string) =>
  value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

export default function RoulettePickerClient({ lng }: RoulettePickerClientProps) {
  const { t } = useTranslation(lng, 'roulette-picker');
  const [itemsInput, setItemsInput] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<Array<{ id: string; value: string }>>([]);
  const [copied, setCopied] = useState(false);

  const items = useMemo(() => parseItems(itemsInput), [itemsInput]);
  const canSpin = items.length >= 2;

  const handleSpin = () => {
    if (!canSpin) return;
    const choice = items[Math.floor(Math.random() * items.length)];
    const entry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, value: choice };
    setResult(choice);
    setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));
    setCopied(false);
  };

  const handleClear = () => {
    setItemsInput('');
    setResult('');
    setHistory([]);
    setCopied(false);
  };

  const handleExample = () => {
    setItemsInput(EXAMPLE_ITEMS.join('\n'));
    setResult('');
    setHistory([]);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy result:', error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="space-y-1">
          <Text asChild variant="d2" color="basic-2">
            <label htmlFor="roulette-items">{t('label.items')}</label>
          </Text>
          <Text variant="c1" color="basic-5">
            {t('helper.separator')}
          </Text>
        </div>
        <Textarea
          id="roulette-items"
          rows={6}
          placeholder={t('placeholder.items')}
          value={itemsInput}
          onChange={(event) => setItemsInput(event.target.value)}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Text variant="c1" color="basic-5">
            {t('helper.count', { count: items.length })}
          </Text>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="px-3 py-2 text-xs bg-zinc-800 hover:bg-zinc-700"
              onClick={handleExample}
            >
              {t('button.example')}
            </Button>
            <Button
              type="button"
              className="px-3 py-2 text-xs bg-zinc-600 hover:bg-zinc-500"
              onClick={handleClear}
              disabled={!itemsInput && !result && history.length === 0}
            >
              {t('button.clear')}
            </Button>
          </div>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-point-2" />
            <Text asChild variant="d2" color="basic-2">
              <h2>{t('label.result')}</h2>
            </Text>
          </div>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!result}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
        <div className="rounded-2xl border border-dashed border-zinc-200 px-4 py-6 text-center text-lg font-semibold text-zinc-800 dark:border-zinc-700 dark:text-zinc-100">
          {result || t('empty.result')}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={handleSpin} disabled={!canSpin} className="flex-1">
            {t('button.spin')}
          </Button>
          {!canSpin && (
            <Text variant="c1" color="basic-5">
              {t('helper.needMore')}
            </Text>
          )}
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text asChild variant="d2" color="basic-2">
          <h2>{t('label.history')}</h2>
        </Text>
        {history.length === 0 ? (
          <Text variant="c1" color="basic-5">
            {t('empty.history')}
          </Text>
        ) : (
          <ul className="space-y-2">
            {history.map((item, index) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200/70 bg-white/80 px-3 py-2 text-sm text-zinc-700 shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/60 dark:text-zinc-200"
              >
                <span>{item.value}</span>
                <span className="text-xs text-zinc-400">#{history.length - index}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
