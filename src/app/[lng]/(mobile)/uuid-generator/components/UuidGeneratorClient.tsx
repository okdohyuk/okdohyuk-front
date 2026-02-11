'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, RefreshCw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { Textarea } from '@components/basic/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

const clampCount = (value: number) => Math.min(10, Math.max(1, value));

type FormatOption = 'standard' | 'uppercase' | 'compact' | 'braces';

interface UuidGeneratorClientProps {
  lng: Language;
}

export default function UuidGeneratorClient({ lng }: UuidGeneratorClientProps) {
  const { t } = useTranslation(lng, 'uuid-generator');
  const [count, setCount] = useState(1);
  const [format, setFormat] = useState<FormatOption>('standard');
  const [uuids, setUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const formatUuid = useCallback(
    (value: string) => {
      switch (format) {
        case 'uppercase':
          return value.toUpperCase();
        case 'compact':
          return value.replace(/-/g, '');
        case 'braces':
          return `{${value}}`;
        default:
          return value;
      }
    },
    [format],
  );

  const generateUuids = useCallback(() => {
    const nextUuids = Array.from({ length: count }, () => formatUuid(uuidv4()));
    setUuids(nextUuids);
  }, [count, formatUuid]);

  useEffect(() => {
    generateUuids();
  }, [generateUuids]);

  useEffect(() => {
    setCopied(false);
  }, [uuids]);

  const outputText = useMemo(() => uuids.join('\n'), [uuids]);

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy UUIDs:', error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
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
              min={1}
              max={10}
              value={count}
              onChange={(event) => {
                const next = Number(event.target.value);
                setCount(clampCount(Number.isNaN(next) ? 1 : next));
              }}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper.count')}</p>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="uuid-format"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.format')}
            </label>
            <Select value={format} onValueChange={(value) => setFormat(value as FormatOption)}>
              <SelectTrigger id="uuid-format" aria-label={t('label.format')}>
                <SelectValue placeholder={t('placeholder.format')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">{t('format.standard')}</SelectItem>
                <SelectItem value="uppercase">{t('format.uppercase')}</SelectItem>
                <SelectItem value="compact">{t('format.compact')}</SelectItem>
                <SelectItem value="braces">{t('format.braces')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper.format')}</p>
          </div>
        </div>
        <Button type="button" onClick={generateUuids} className="flex items-center gap-2 text-sm">
          <RefreshCw size={16} />
          {t('button.generate')}
        </Button>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('label.output')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper.output')}</p>
          </div>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!outputText}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
        <Textarea
          readOnly
          rows={Math.max(4, count)}
          className="font-mono text-sm"
          value={outputText}
          placeholder={t('empty')}
        />
      </section>
    </div>
  );
}
