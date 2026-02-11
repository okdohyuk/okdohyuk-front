'use client';

import React, { useState } from 'react';
import { Clipboard, ClipboardCheck, RefreshCcw } from 'lucide-react';
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

const MIN_COUNT = 1;
const MAX_COUNT = 10;

const buildUuid = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return uuidv4();
};

const createUuidBatch = (amount: number) => Array.from({ length: amount }, () => buildUuid());

interface UuidGeneratorClientProps {
  lng: Language;
}

export default function UuidGeneratorClient({ lng }: UuidGeneratorClientProps) {
  const { t } = useTranslation(lng, 'uuid-generator');
  const [count, setCount] = useState(3);
  const [uuids, setUuids] = useState<string[]>(() => createUuidBatch(3));
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerate = () => {
    setUuids(createUuidBatch(count));
    setCopiedAll(false);
    setCopiedId(null);
  };

  const handleCopyAll = async () => {
    if (!uuids.length) return;
    try {
      await navigator.clipboard.writeText(uuids.join('\n'));
      setCopiedAll(true);
      setCopiedId(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy UUIDs:', error);
    }
  };

  const handleCopyOne = async (uuid: string) => {
    try {
      await navigator.clipboard.writeText(uuid);
      setCopiedId(uuid);
      setCopiedAll(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy UUID:', error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="uuid-count"
            className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
          >
            {t('label.count')}
          </label>
          <Button
            type="button"
            onClick={handleGenerate}
            className="flex items-center gap-2 px-3 py-2 text-xs"
          >
            <RefreshCcw size={16} />
            {t('button.generate')}
          </Button>
        </div>
        <Input
          id="uuid-count"
          type="number"
          min={MIN_COUNT}
          max={MAX_COUNT}
          value={count}
          onChange={(event) => {
            const nextValue = Number(event.target.value);
            if (Number.isNaN(nextValue)) {
              setCount(MIN_COUNT);
              return;
            }
            setCount(Math.max(MIN_COUNT, Math.min(MAX_COUNT, nextValue)));
          }}
          className="w-24 text-center"
          placeholder={t('placeholder.count')}
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('helper')}</p>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            {t('label.output')}
          </span>
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
          <ul className="space-y-2">
            {uuids.map((uuid) => (
              <li key={uuid} className={cn(SERVICE_PANEL_SOFT, 'flex items-center gap-2 p-3')}>
                <code className="flex-1 break-all text-sm font-mono text-zinc-800 dark:text-zinc-100">
                  {uuid}
                </code>
                <Button
                  type="button"
                  onClick={() => handleCopyOne(uuid)}
                  className="flex items-center gap-2 px-3 py-2 text-xs"
                >
                  {copiedId === uuid ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
                  {copiedId === uuid ? t('button.copied') : t('button.copy')}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('empty')}</p>
        )}
      </div>
    </div>
  );
}
