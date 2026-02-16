'use client';

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Clipboard, ClipboardCheck, RefreshCw } from 'lucide-react';
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

const createUuid = () => uuidv4();

export default function UuidGeneratorClient({ lng }: UuidGeneratorClientProps) {
  const { t } = useTranslation(lng, 'uuid-generator');
  const [uuid, setUuid] = useState(() => createUuid());
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setUuid(createUuid());
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!uuid) return;
    try {
      await navigator.clipboard.writeText(uuid);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy uuid:', error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="uuid-output"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.output')}
        </label>
        <Input
          id="uuid-output"
          className="font-mono"
          value={uuid}
          readOnly
          placeholder={t('empty')}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'flex flex-wrap gap-2 p-4')}>
        <Button type="button" onClick={handleGenerate} className="flex items-center gap-2">
          <RefreshCw size={16} />
          {t('button.generate')}
        </Button>
        <Button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-2"
          disabled={!uuid}
        >
          {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
          {copied ? t('button.copied') : t('button.copy')}
        </Button>
      </div>
    </div>
  );
}
