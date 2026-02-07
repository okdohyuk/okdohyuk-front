'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, Eraser } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Textarea } from '@components/basic/Textarea';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface WhitespaceCleanerClientProps {
  lng: Language;
}

const DEFAULT_SAMPLE = `   Hello,   world!\n\nThis   line has    extra spaces.   \n\t\tTabs too.\n\n   Trim me   `;

export default function WhitespaceCleanerClient({ lng }: WhitespaceCleanerClientProps) {
  const { t } = useTranslation(lng, 'whitespace-cleaner');
  const [value, setValue] = useState('');
  const [copied, setCopied] = useState(false);
  const [trimLines, setTrimLines] = useState(true);
  const [collapseSpaces, setCollapseSpaces] = useState(true);
  const [removeEmptyLines, setRemoveEmptyLines] = useState(false);

  const cleaned = useMemo(() => {
    if (!value) return '';
    let result = value.replace(/\r\n?/g, '\n');

    if (trimLines) {
      result = result
        .split('\n')
        .map((line) => line.trim())
        .join('\n');
    }

    if (collapseSpaces) {
      result = result.replace(/[\t ]{2,}/g, ' ');
    }

    if (removeEmptyLines) {
      result = result
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .join('\n');
    }

    return result;
  }, [value, trimLines, collapseSpaces, removeEmptyLines]);

  const stats = useMemo(() => {
    if (!cleaned) {
      return { chars: 0, lines: 0 };
    }
    return {
      chars: cleaned.length,
      lines: cleaned.split('\n').length,
    };
  }, [cleaned]);

  const handleCopy = async () => {
    if (!cleaned) return;
    try {
      await navigator.clipboard.writeText(cleaned);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy cleaned text:', error);
    }
  };

  const handleClear = () => {
    setValue('');
    setCopied(false);
  };

  const handleSample = () => {
    setValue(DEFAULT_SAMPLE);
    setCopied(false);
  };

  return (
    <div className="space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="whitespace-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.input')}
        </label>
        <Textarea
          id="whitespace-input"
          className="min-h-[140px] font-mono text-sm"
          placeholder={t('placeholder')}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setCopied(false);
          }}
        />
        <div className="flex flex-wrap gap-2 text-sm">
          <label
            htmlFor="whitespace-trim-lines"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300"
          >
            <input
              id="whitespace-trim-lines"
              type="checkbox"
              className="h-4 w-4 accent-point-1"
              checked={trimLines}
              onChange={(event) => setTrimLines(event.target.checked)}
            />
            {t('options.trimLines')}
          </label>
          <label
            htmlFor="whitespace-collapse-spaces"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300"
          >
            <input
              id="whitespace-collapse-spaces"
              type="checkbox"
              className="h-4 w-4 accent-point-1"
              checked={collapseSpaces}
              onChange={(event) => setCollapseSpaces(event.target.checked)}
            />
            {t('options.collapseSpaces')}
          </label>
          <label
            htmlFor="whitespace-remove-empty-lines"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300"
          >
            <input
              id="whitespace-remove-empty-lines"
              type="checkbox"
              className="h-4 w-4 accent-point-1"
              checked={removeEmptyLines}
              onChange={(event) => setRemoveEmptyLines(event.target.checked)}
            />
            {t('options.removeEmptyLines')}
          </label>
        </div>
        <Text variant="c1" color="basic-5">
          {t('helper')}
        </Text>
        <div className="flex flex-wrap gap-2">
          <Button type="button" className="gap-2 px-3 py-2 text-xs" onClick={handleSample}>
            <Eraser size={16} />
            {t('button.example')}
          </Button>
          <Button type="button" className="gap-2 px-3 py-2 text-xs" onClick={handleClear}>
            {t('button.clear')}
          </Button>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="whitespace-output"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.output')}
          </label>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span>{t('stats.chars', { count: stats.chars })}</span>
            <span>{t('stats.lines', { count: stats.lines })}</span>
          </div>
        </div>
        <Textarea
          id="whitespace-output"
          className="min-h-[140px] font-mono text-sm"
          value={cleaned}
          readOnly
          placeholder={t('empty')}
        />
        <Button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-2 text-xs"
          disabled={!cleaned}
        >
          {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
          {copied ? t('button.copied') : t('button.copy')}
        </Button>
      </div>
    </div>
  );
}
