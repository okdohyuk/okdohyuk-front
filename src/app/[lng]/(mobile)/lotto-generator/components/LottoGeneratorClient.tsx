'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { H1, Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface LottoGeneratorClientProps {
  lng: Language;
}

type LottoSet = {
  id: string;
  numbers: number[];
};

const clampValue = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const generateNumbers = (count: number, max: number) => {
  const numbers = new Set<number>();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * max) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export default function LottoGeneratorClient({ lng }: LottoGeneratorClientProps) {
  const { t } = useTranslation(lng, 'lotto-generator');
  const [count, setCount] = useState(6);
  const [maxNumber, setMaxNumber] = useState(45);
  const [sets, setSets] = useState<LottoSet[]>([]);
  const [copied, setCopied] = useState(false);

  const normalizedCount = useMemo(
    () => clampValue(count || 0, 1, Math.max(maxNumber, 1)),
    [count, maxNumber],
  );

  const normalizedMax = useMemo(() => clampValue(maxNumber || 0, 5, 99), [maxNumber]);

  const helper = useMemo(
    () => t('helper', { count: normalizedCount, max: normalizedMax }),
    [t, normalizedCount, normalizedMax],
  );

  const handleGenerate = (batch = 1) => {
    const nextSets = Array.from({ length: batch }, () => ({
      id: createId(),
      numbers: generateNumbers(normalizedCount, normalizedMax),
    }));
    setSets((prev) => [...nextSets, ...prev].slice(0, 20));
    setCopied(false);
  };

  const handleReset = () => {
    setSets([]);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (sets.length === 0) return;
    const payload = sets.map((set, index) => `${index + 1}. ${set.numbers.join(', ')}`).join('\n');
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy lotto numbers:', error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="lotto-count"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.count')}
            </label>
            <Input
              id="lotto-count"
              type="number"
              inputMode="numeric"
              value={count}
              min={1}
              max={normalizedMax}
              onChange={(event) => setCount(Number(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="lotto-max"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.max')}
            </label>
            <Input
              id="lotto-max"
              type="number"
              inputMode="numeric"
              value={maxNumber}
              min={5}
              max={99}
              onChange={(event) => setMaxNumber(Number(event.target.value))}
            />
          </div>
        </div>

        <Text variant="c1" color="basic-5" className="block">
          {helper}
        </Text>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => handleGenerate(1)}>
            <Plus size={16} />
            {t('button.generateOne')}
          </Button>
          <Button type="button" variant="secondary" onClick={() => handleGenerate(5)}>
            <RefreshCw size={16} />
            {t('button.generateBatch')}
          </Button>
          <Button type="button" variant="ghost" onClick={handleReset} className="gap-2">
            <Trash2 size={16} />
            {t('button.clear')}
          </Button>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Text variant="d2" color="basic-4" className="block">
              {t('result.title')}
            </Text>
            <H1 className="text-3xl">{sets.length ? t('result.ready') : t('result.empty')}</H1>
            <Text variant="c1" color="basic-5" className="block">
              {sets.length ? t('result.helper') : t('result.emptyHelper')}
            </Text>
          </div>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={sets.length === 0}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>

        <div className="space-y-2">
          {sets.length === 0 ? (
            <div className="rounded-lg bg-white/60 px-3 py-2 text-xs text-gray-600 dark:bg-white/5 dark:text-gray-300">
              {t('result.preview')}
            </div>
          ) : (
            sets.map((set, index) => (
              <div
                key={set.id}
                className="flex flex-wrap items-center gap-2 rounded-lg bg-white/60 px-3 py-2 text-xs text-gray-600 dark:bg-white/5 dark:text-gray-300"
              >
                <span className="font-semibold">{index + 1}.</span>
                {set.numbers.map((number) => (
                  <span
                    key={`${set.id}-${number}`}
                    className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-800 shadow-sm dark:bg-zinc-900 dark:text-gray-100"
                  >
                    {number}
                  </span>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
