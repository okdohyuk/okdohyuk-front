'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck } from 'lucide-react';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface TextReverserClientProps {
  lng: Language;
}

export default function TextReverserClient({ lng }: TextReverserClientProps) {
  const { t } = useTranslation(lng, 'text-reverser');
  const [value, setValue] = useState('');
  const [copied, setCopied] = useState(false);

  const reversed = useMemo(() => {
    if (!value) return '';
    return [...value].reverse().join('');
  }, [value]);

  useEffect(() => {
    setCopied(false);
  }, [reversed]);

  const handleCopy = async () => {
    if (!reversed) return;
    try {
      await navigator.clipboard.writeText(reversed);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy reversed text:', error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="reverse-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.input')}
        </label>
        <Textarea
          id="reverse-input"
          className="min-h-[120px] font-mono"
          placeholder={t('placeholder')}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="reverse-output"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.output')}
          </label>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!reversed}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
        <Textarea
          id="reverse-output"
          className="min-h-[120px] font-mono"
          value={reversed}
          readOnly
          placeholder={t('empty')}
        />
      </div>
    </div>
  );
}
