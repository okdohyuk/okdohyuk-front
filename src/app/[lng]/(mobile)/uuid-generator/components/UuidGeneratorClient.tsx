'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, RotateCcw } from 'lucide-react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Textarea } from '@components/basic/Textarea';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface UuidGeneratorClientProps {
  lng: Language;
}

const DEFAULT_COUNT = 3;
const MIN_COUNT = 1;
const MAX_COUNT = 12;

const clampCount = (value: number) => Math.max(MIN_COUNT, Math.min(MAX_COUNT, value));

const createUuid = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] % 16) + 64;
  bytes[8] = (bytes[8] % 64) + 128;

  const toHex = (value: number) => value.toString(16).padStart(2, '0');
  const hex = Array.from(bytes, toHex).join('');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
};

const generateUuids = (count: number) => Array.from({ length: count }, createUuid);

export default function UuidGeneratorClient({ lng }: UuidGeneratorClientProps) {
  const { t } = useTranslation(lng, 'uuid-generator');
  const [count, setCount] = useState(DEFAULT_COUNT);
  const [uuids, setUuids] = useState(() => generateUuids(DEFAULT_COUNT));
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => uuids.join('\n'), [uuids]);
  const rows = Math.min(10, Math.max(4, uuids.length + 1));

  const handleCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value);
    if (Number.isNaN(nextValue)) {
      setCount(MIN_COUNT);
      return;
    }
    setCount(clampCount(nextValue));
  };

  const handleGenerate = () => {
    setUuids(generateUuids(count));
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy UUIDs:', error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <label
          htmlFor="uuid-count"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.count')}
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            id="uuid-count"
            type="number"
            min={MIN_COUNT}
            max={MAX_COUNT}
            value={count}
            onChange={handleCountChange}
            className="w-28 text-center"
          />
          <Button
            type="button"
            onClick={handleGenerate}
            className="flex items-center gap-2 px-3 py-2 text-xs"
          >
            <RotateCcw size={16} />
            {t('button.generate')}
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="uuid-output"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.output')}
          </label>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!output}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
        <Textarea
          id="uuid-output"
          className="font-mono"
          rows={rows}
          value={output}
          readOnly
          placeholder={t('empty')}
        />
      </div>
    </div>
  );
}
