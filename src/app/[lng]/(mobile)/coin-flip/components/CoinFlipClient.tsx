'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

const MAX_COINS = 20;

type CoinFlipClientProps = {
  lng: Language;
};

const getSafeCount = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return 1;
  }
  return Math.min(Math.max(parsed, 1), MAX_COINS);
};

type CoinResult = {
  id: string;
  value: 'heads' | 'tails';
};

const createResultId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const buildResults = (count: number): CoinResult[] =>
  Array.from({ length: count }, () => ({
    id: createResultId(),
    value: Math.random() < 0.5 ? 'heads' : 'tails',
  }));

export default function CoinFlipClient({ lng }: CoinFlipClientProps) {
  const { t } = useTranslation(lng, 'coin-flip');
  const [countInput, setCountInput] = useState('1');
  const [results, setResults] = useState<CoinResult[]>([]);

  const safeCount = useMemo(() => getSafeCount(countInput), [countInput]);
  const summary = useMemo(() => {
    const heads = results.filter((result) => result.value === 'heads').length;
    const tails = results.filter((result) => result.value === 'tails').length;
    return {
      heads,
      tails,
      total: results.length,
    };
  }, [results]);

  const handleFlip = () => {
    const nextResults = buildResults(safeCount);
    setResults(nextResults);
  };

  const handleReset = () => {
    setResults([]);
    setCountInput('1');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <label
            htmlFor="coin-count"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.count')}
          </label>
          <Input
            id="coin-count"
            type="number"
            min={1}
            max={MAX_COINS}
            value={countInput}
            onChange={(event) => setCountInput(event.target.value)}
            className="font-mono"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleFlip} className="px-4 py-2 text-sm">
            {t('button.flip')}
          </Button>
          <Button
            onClick={handleReset}
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
          >
            {t('button.reset')}
          </Button>
        </div>

        <div className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-3')}>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {t('summary.title')}
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
            <span className="rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-800">
              {t('summary.total', { count: summary.total || safeCount })}
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-800">
              {t('summary.heads', { count: summary.heads })}
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-800">
              {t('summary.tails', { count: summary.tails })}
            </span>
          </div>
        </div>
      </section>

      <section
        className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-3 p-4 min-h-[240px]')}
      >
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {t('result.title')}
        </h3>
        {results.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('result.empty')}</p>
        ) : (
          <ul className="grid gap-2">
            {results.map((result, index) => (
              <li
                key={result.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200/70 bg-white/80 px-3 py-2 text-sm text-gray-800 shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-gray-100"
              >
                <span className="font-medium">{t('result.coinLabel', { index: index + 1 })}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-semibold',
                    result.value === 'heads'
                      ? 'bg-point-1/15 text-point-1'
                      : 'bg-point-4/40 text-zinc-700 dark:text-zinc-200',
                  )}
                >
                  {t(`result.${result.value}`)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
