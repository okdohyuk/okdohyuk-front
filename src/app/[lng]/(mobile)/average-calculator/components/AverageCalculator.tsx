'use client';

import React, { useMemo, useState } from 'react';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';
import { H1, Text } from '@components/basic/Text';
import { Textarea } from '@components/basic/Textarea';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface AverageCalculatorProps {
  lng: Language;
  title: string;
  description: string;
}

const numberRegex = /-?\d{1,3}(?:,\d{3})*(?:\.\d+)?|-?\d+(?:\.\d+)?/g;

export default function AverageCalculator({ lng, title, description }: AverageCalculatorProps) {
  const { t } = useTranslation(lng, 'average-calculator');
  const [rawInput, setRawInput] = useState('');
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [copied, setCopied] = useState(false);

  const numbers = useMemo(() => {
    const matches = rawInput.match(numberRegex) ?? [];
    return matches
      .map((value) => Number(value.replace(/,/g, '')))
      .filter((value) => !Number.isNaN(value));
  }, [rawInput]);

  const stats = useMemo(() => {
    if (numbers.length === 0) {
      return null;
    }

    const sorted = [...numbers].sort((a, b) => a - b);
    const sum = numbers.reduce((acc, value) => acc + value, 0);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

    return {
      count: numbers.length,
      sum,
      average: sum / numbers.length,
      median,
      min: sorted[0],
      max: sorted[sorted.length - 1],
    };
  }, [numbers]);

  const formatNumber = (value: number) => {
    if (Number.isNaN(value)) {
      return '-';
    }
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  };

  const handleCopy = async () => {
    if (!stats) return;
    const summary = [
      `${t('stats.count')}: ${stats.count}`,
      `${t('stats.sum')}: ${formatNumber(stats.sum)}`,
      `${t('stats.average')}: ${formatNumber(stats.average)}`,
      `${t('stats.median')}: ${formatNumber(stats.median)}`,
      `${t('stats.min')}: ${formatNumber(stats.min)}`,
      `${t('stats.max')}: ${formatNumber(stats.max)}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Copy failed', error);
    }
  };

  const handleSample = () => {
    setRawInput('12\n24\n35.5\n7\n18\n22');
  };

  const handleClear = () => {
    setRawInput('');
    setCopied(false);
  };

  const statRows = [
    ['stats.count', stats?.count?.toString() ?? '-'],
    ['stats.sum', stats ? formatNumber(stats.sum) : '-'],
    ['stats.average', stats ? formatNumber(stats.average) : '-'],
    ['stats.median', stats ? formatNumber(stats.median) : '-'],
    ['stats.min', stats ? formatNumber(stats.min) : '-'],
    ['stats.max', stats ? formatNumber(stats.max) : '-'],
  ] as const;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <H1>{title}</H1>
        <Text variant="d2" color="basic-4">
          {description}
        </Text>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <label htmlFor="number-input" className="space-y-2 block">
          <Text variant="d2" className="font-semibold">
            {t('label.input')}
          </Text>
          <Text variant="d3" color="basic-5">
            {t('helper.input')}
          </Text>
        </label>
        <Textarea
          id="number-input"
          className="min-h-[160px] font-mono"
          placeholder={t('placeholder.input')}
          value={rawInput}
          onChange={(event) => setRawInput(event.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleSample} className="px-4 py-2 text-sm">
            {t('button.sample')}
          </Button>
          <Button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
          >
            {t('button.clear')}
          </Button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Text variant="d2" className="font-semibold">
              {t('label.decimals')}
            </Text>
            <Input
              type="number"
              min={0}
              max={6}
              value={decimalPlaces}
              onChange={(event) => {
                const nextValue = Number(event.target.value);
                if (Number.isNaN(nextValue)) {
                  setDecimalPlaces(0);
                  return;
                }
                setDecimalPlaces(Math.min(6, Math.max(0, nextValue)));
              }}
              className="w-20 text-center"
            />
          </div>
          <Text variant="d3" color="basic-5">
            {t('helper.decimals')}
          </Text>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Text variant="d2" className="font-semibold">
            {t('label.summary')}
          </Text>
          <Button
            type="button"
            onClick={handleCopy}
            disabled={!stats}
            className="px-4 py-2 text-sm"
          >
            {copied ? t('message.copied') : t('button.copy')}
          </Button>
        </div>

        {stats ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {statRows.map(([labelKey, value]) => (
              <div
                key={labelKey}
                className={cn(
                  SERVICE_PANEL_SOFT,
                  SERVICE_CARD_INTERACTIVE,
                  'flex items-center justify-between px-4 py-3',
                )}
              >
                <Text variant="d3" color="basic-5">
                  {t(labelKey)}
                </Text>
                <Text variant="d2" className="font-semibold">
                  {value}
                </Text>
              </div>
            ))}
          </div>
        ) : (
          <div className={cn(SERVICE_PANEL_SOFT, 'p-4 text-center')}>
            <Text variant="d3" color="basic-5">
              {t('empty')}
            </Text>
          </div>
        )}
      </section>
    </div>
  );
}
