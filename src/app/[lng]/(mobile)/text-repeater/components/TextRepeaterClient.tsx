'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck } from 'lucide-react';
import { Input } from '@components/basic/Input';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface TextRepeaterClientProps {
  lng: Language;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function TextRepeaterClient({ lng }: TextRepeaterClientProps) {
  const { t } = useTranslation(lng, 'text-repeater');
  const [value, setValue] = useState('');
  const [countInput, setCountInput] = useState('3');
  const [separatorInput, setSeparatorInput] = useState('\\n');
  const [copied, setCopied] = useState(false);

  const repeatCount = useMemo(() => {
    const parsed = Number.parseInt(countInput, 10);
    if (Number.isNaN(parsed)) return 1;
    return clamp(parsed, 1, 500);
  }, [countInput]);

  const separator = useMemo(() => {
    return separatorInput.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
  }, [separatorInput]);

  const output = useMemo(() => {
    if (!value.trim()) return '';
    return Array.from({ length: repeatCount }, () => value).join(separator);
  }, [repeatCount, separator, value]);

  useEffect(() => {
    setCopied(false);
  }, [output]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy repeated text:', error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <label
            htmlFor="text-repeater-input"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.input')}
          </label>
          <Textarea
            id="text-repeater-input"
            className="min-h-[120px]"
            placeholder={t('placeholder.input')}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="text-repeater-count"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.count')}
            </label>
            <Input
              id="text-repeater-count"
              type="number"
              min={1}
              max={500}
              value={countInput}
              onChange={(event) => setCountInput(event.target.value)}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('helper.count', { max: 500 })}
            </p>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="text-repeater-separator"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.separator')}
            </label>
            <Input
              id="text-repeater-separator"
              value={separatorInput}
              placeholder={t('placeholder.separator')}
              onChange={(event) => setSeparatorInput(event.target.value)}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper.separator')}</p>
          </div>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="text-repeater-output"
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
          id="text-repeater-output"
          className="min-h-[140px] font-mono"
          value={output}
          readOnly
          placeholder={t('empty')}
        />
      </div>
    </div>
  );
}
