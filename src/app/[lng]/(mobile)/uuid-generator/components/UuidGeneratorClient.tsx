'use client';

import React, { useCallback, useMemo, useState } from 'react';
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

interface UuidGeneratorClientProps {
  lng: Language;
}

const createUuid = () => {
  if (typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }

  return uuidv4();
};

export default function UuidGeneratorClient({ lng }: UuidGeneratorClientProps) {
  const { t } = useTranslation(lng, 'uuid-generator');
  const [value, setValue] = useState(() => createUuid());
  const [copied, setCopied] = useState(false);

  const helperText = useMemo(() => t('helper'), [t]);

  const handleGenerate = useCallback(() => {
    setValue(createUuid());
    setCopied(false);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy UUID:', error);
    }
  }, [value]);

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="uuid-output"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.output')}
        </label>
        <Input id="uuid-output" className="font-mono" value={value} readOnly />
        <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('label.action')}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" onClick={handleGenerate} className="flex items-center gap-2">
              <RefreshCcw size={16} />
              {t('button.generate')}
            </Button>
            <Button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-2"
              disabled={!value}
            >
              {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
              {copied ? t('button.copied') : t('button.copy')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
