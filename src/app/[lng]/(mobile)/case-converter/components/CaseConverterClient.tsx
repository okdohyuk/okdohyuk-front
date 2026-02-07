'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Textarea } from '@components/basic/Textarea';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface CaseConverterClientProps {
  lng: Language;
}

const toTitleCase = (text: string) =>
  text.toLowerCase().replace(/\b([a-z])/g, (match) => match.toUpperCase());

const toSentenceCase = (text: string) =>
  text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (match) => match.toUpperCase());

export default function CaseConverterClient({ lng }: CaseConverterClientProps) {
  const { t } = useTranslation(lng, 'case-converter');
  const [value, setValue] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const outputs = useMemo(
    () => [
      { id: 'upper', label: t('output.upper'), value: value.toUpperCase() },
      { id: 'lower', label: t('output.lower'), value: value.toLowerCase() },
      { id: 'title', label: t('output.title'), value: toTitleCase(value) },
      { id: 'sentence', label: t('output.sentence'), value: toSentenceCase(value) },
    ],
    [t, value],
  );

  useEffect(() => {
    setCopiedKey(null);
  }, [value]);

  const handleCopy = async (id: string, text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(id);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy converted text:', error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="case-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.input')}
        </label>
        <Textarea
          id="case-input"
          className="min-h-[140px] resize-none font-mono"
          placeholder={t('placeholder')}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {outputs.map((output) => {
          const isCopied = copiedKey === output.id;
          return (
            <div
              key={output.id}
              className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-3 p-4')}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {output.label}
                </span>
                <Button
                  type="button"
                  onClick={() => handleCopy(output.id, output.value)}
                  className="flex items-center gap-2 px-3 py-2 text-xs"
                  disabled={!output.value}
                >
                  {isCopied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
                  {isCopied ? t('button.copied') : t('button.copy')}
                </Button>
              </div>
              <Textarea
                className="min-h-[120px] resize-none font-mono"
                value={output.value}
                readOnly
                placeholder={t('empty')}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
