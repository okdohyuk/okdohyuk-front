'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, RefreshCcw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
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
const MAX_COUNT = 10;
const DEFAULT_COUNT = 3;

const formatUuid = (value: string, uppercase: boolean) =>
  uppercase ? value.toUpperCase() : value.toLowerCase();

const createUuid = () => uuidv4();

const createUuidList = (count: number, uppercase: boolean) =>
  Array.from({ length: count }, () => formatUuid(createUuid(), uppercase));

export default function UuidGeneratorClient({ lng }: UuidGeneratorClientProps) {
  const { t } = useTranslation(lng, 'uuid-generator');
  const [countInput, setCountInput] = useState(String(DEFAULT_COUNT));
  const [uppercase, setUppercase] = useState(false);
  const [uuids, setUuids] = useState(() => createUuidList(DEFAULT_COUNT, false));
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const count = useMemo(() => {
    const parsed = Number(countInput);
    if (Number.isNaN(parsed)) return DEFAULT_COUNT;
    return Math.min(MAX_COUNT, Math.max(MIN_COUNT, parsed));
  }, [countInput]);

  const handleGenerate = () => {
    setUuids(createUuidList(count, uppercase));
    setCopiedIndex(null);
    setCopiedAll(false);
  };

  const handleUppercaseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.checked;
    setUppercase(nextValue);
    setUuids((prev) => prev.map((uuid) => formatUuid(uuid, nextValue)));
    setCopiedIndex(null);
    setCopiedAll(false);
  };

  const handleCountBlur = () => {
    setCountInput(String(count));
  };

  const handleCopyAll = async () => {
    if (!uuids.length) return;
    try {
      await navigator.clipboard.writeText(uuids.join('\n'));
      setCopiedAll(true);
      setCopiedIndex(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy UUIDs:', error);
    }
  };

  const handleCopyItem = async (value: string, index: number) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedIndex(index);
      setCopiedAll(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy UUID:', error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="uuid-count"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.count')}
            </label>
            <Input
              id="uuid-count"
              type="number"
              min={MIN_COUNT}
              max={MAX_COUNT}
              className="font-mono"
              value={countInput}
              onChange={(event) => setCountInput(event.target.value)}
              onBlur={handleCountBlur}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
          </div>
          <div className="flex flex-col justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                id="uuid-uppercase"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-point-1 focus:ring-point-1 dark:border-gray-600"
                checked={uppercase}
                onChange={handleUppercaseChange}
              />
              <label
                htmlFor="uuid-uppercase"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('label.uppercase')}
              </label>
            </div>
            <Button type="button" onClick={handleGenerate} className="gap-2 px-3 py-2 text-xs">
              <RefreshCcw size={16} />
              {t('button.generate')}
            </Button>
          </div>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('label.results')}
          </p>
          <Button
            type="button"
            onClick={handleCopyAll}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!uuids.length}
          >
            {copiedAll ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copiedAll ? t('button.copied') : t('button.copyAll')}
          </Button>
        </div>
        {uuids.length ? (
          <div className="space-y-2">
            {uuids.map((uuid, index) => (
              <div
                key={uuid}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <span className="font-mono text-xs sm:text-sm">{uuid}</span>
                <Button
                  type="button"
                  onClick={() => handleCopyItem(uuid, index)}
                  className="flex items-center gap-2 px-2 py-1 text-[11px]"
                >
                  {copiedIndex === index ? <ClipboardCheck size={14} /> : <Clipboard size={14} />}
                  {copiedIndex === index ? t('button.copied') : t('button.copy')}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('empty')}</p>
        )}
      </div>
    </div>
  );
}
