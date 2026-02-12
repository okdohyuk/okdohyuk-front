'use client';

import React, { useId, useMemo, useState } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface RandomPickerProps {
  lng: Language;
}

const parseItems = (value: string) =>
  value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const shuffleItems = (items: string[]) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export default function RandomPicker({ lng }: RandomPickerProps) {
  const { t } = useTranslation(lng, 'random-picker');
  const [rawItems, setRawItems] = useState('');
  const [count, setCount] = useState('1');
  const [result, setResult] = useState<{ id: string; label: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const itemsId = useId();
  const countId = useId();

  const items = useMemo(() => parseItems(rawItems), [rawItems]);

  const handleDraw = () => {
    const parsedCount = Number.parseInt(count, 10);

    if (!items.length) {
      setError(t('error.empty'));
      setResult([]);
      return;
    }

    if (Number.isNaN(parsedCount) || parsedCount <= 0) {
      setError(t('error.invalidCount'));
      setResult([]);
      return;
    }

    if (parsedCount > items.length) {
      setError(t('error.tooMany', { count: items.length }));
      setResult([]);
      return;
    }

    setError(null);
    setResult(
      shuffleItems(items)
        .slice(0, parsedCount)
        .map((item) => ({ id: crypto.randomUUID(), label: item })),
    );
  };

  const handleReset = () => {
    setRawItems('');
    setCount('1');
    setResult([]);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <ServicePageHeader title={t('title')} description={t('description')} badge={t('badge')} />

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <label
            htmlFor={itemsId}
            className="text-sm font-semibold text-zinc-700 dark:text-zinc-200"
          >
            {t('labels.items')}
          </label>
          <Textarea
            id={itemsId}
            rows={6}
            value={rawItems}
            onChange={(event) => setRawItems(event.target.value)}
            placeholder={t('placeholder.items')}
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('helper.items')}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-2">
            <label
              htmlFor={countId}
              className="text-sm font-semibold text-zinc-700 dark:text-zinc-200"
            >
              {t('labels.count')}
            </label>
            <Input
              id={countId}
              type="number"
              min={1}
              value={count}
              onChange={(event) => setCount(event.target.value)}
              placeholder={t('placeholder.count')}
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('helper.count')}</p>
          </div>

          <Button className="h-12 w-full text-sm font-semibold" onClick={handleDraw}>
            {t('buttons.draw')}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span>{t('status.itemsCount', { count: items.length })}</span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span>{t('status.ready')}</span>
        </div>

        {error ? (
          <p className="text-sm font-semibold text-red-500 dark:text-red-400">{error}</p>
        ) : null}

        <button
          type="button"
          onClick={handleReset}
          className={cn(
            SERVICE_CARD_INTERACTIVE,
            'inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/80 px-3 py-2 text-sm font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200',
          )}
        >
          <RotateCcw className="h-4 w-4" />
          {t('buttons.reset')}
        </button>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          <Sparkles className="h-4 w-4 text-point-1" />
          {t('result.title', { count: result.length })}
        </div>

        {result.length ? (
          <ul className="flex flex-wrap gap-2">
            {result.map((item) => (
              <li
                key={item.id}
                className="rounded-full border border-point-2/50 bg-point-2/15 px-3 py-1 text-xs font-semibold text-point-1 dark:border-point-2/40 dark:bg-point-1/20 dark:text-point-2"
              >
                {item.label}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('result.empty')}</p>
        )}
      </section>
    </div>
  );
}
