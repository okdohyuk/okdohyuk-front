'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, RefreshCw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface UuidGeneratorClientProps {
  lng: Language;
}

const MIN_COUNT = 1;
const MAX_COUNT = 20;

export default function UuidGeneratorClient({ lng }: UuidGeneratorClientProps) {
  const { t } = useTranslation(lng, 'uuid-generator');
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const canCopyAll = uuids.length > 0;

  const generate = useCallback(() => {
    const nextCount = Math.min(Math.max(count, MIN_COUNT), MAX_COUNT);
    setUuids(Array.from({ length: nextCount }, () => uuidv4()));
    setCopiedIndex(null);
    setCopiedAll(false);
  }, [count]);

  useEffect(() => {
    generate();
  }, [generate]);

  const handleCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value);
    if (Number.isNaN(nextValue)) {
      setCount(MIN_COUNT);
      return;
    }
    setCount(nextValue);
  };

  const handleCopyAll = async () => {
    if (!canCopyAll) return;
    try {
      await navigator.clipboard.writeText(uuids.join('\n'));
      setCopiedAll(true);
      setCopiedIndex(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy UUID list:', error);
    }
  };

  const handleCopySingle = async (value: string, index: number) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedIndex(index);
      setCopiedAll(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy UUID:', error);
    }
  };

  const countHelper = useMemo(
    () =>
      t('helper', {
        min: MIN_COUNT,
        max: MAX_COUNT,
      }),
    [t],
  );

  return (
    <div className="w-full space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="uuid-count"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.count')}
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            id="uuid-count"
            type="number"
            min={MIN_COUNT}
            max={MAX_COUNT}
            value={count}
            onChange={handleCountChange}
            className="w-full sm:w-40"
          />
          <Button type="button" onClick={generate} className="flex items-center gap-2">
            <RefreshCw size={16} />
            {t('button.generate')}
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{countHelper}</p>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('label.list')}
          </h2>
          <Button
            type="button"
            onClick={handleCopyAll}
            disabled={!canCopyAll}
            className="flex items-center gap-2 px-3 py-2 text-xs"
          >
            {copiedAll ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copiedAll ? t('button.copied') : t('button.copyAll')}
          </Button>
        </div>

        <div className="space-y-2">
          {uuids.map((uuid, index) => (
            <div
              key={uuid}
              className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-mono break-all">{uuid}</span>
              <Button
                type="button"
                onClick={() => handleCopySingle(uuid, index)}
                className="flex items-center gap-2 px-3 py-2 text-xs"
              >
                {copiedIndex === index ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
                {copiedIndex === index ? t('button.copied') : t('button.copy')}
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
