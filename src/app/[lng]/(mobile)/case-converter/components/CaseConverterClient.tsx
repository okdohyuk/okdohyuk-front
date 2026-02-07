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

const modeKeys = ['upper', 'lower', 'title', 'sentence', 'toggle'] as const;

type ModeKey = (typeof modeKeys)[number];

interface CaseConverterClientProps {
  lng: Language;
}

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .replace(
      /(^|[\s\-_/]+)(\p{L})/gu,
      (_, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`,
    );

const toSentenceCase = (value: string) => {
  const lower = value.toLowerCase();
  return lower.replace(/(^\s*\p{L}|[.!?]\s*\p{L})/gu, (match) => match.toUpperCase());
};

const toToggleCase = (value: string) =>
  value
    .split('')
    .map((char) => {
      const upper = char.toUpperCase();
      const lower = char.toLowerCase();
      if (char === upper && char !== lower) return lower;
      if (char === lower && char !== upper) return upper;
      return char;
    })
    .join('');

const transformText = (value: string, mode: ModeKey) => {
  switch (mode) {
    case 'upper':
      return value.toUpperCase();
    case 'lower':
      return value.toLowerCase();
    case 'title':
      return toTitleCase(value);
    case 'sentence':
      return toSentenceCase(value);
    case 'toggle':
      return toToggleCase(value);
    default:
      return value;
  }
};

export default function CaseConverterClient({ lng }: CaseConverterClientProps) {
  const { t } = useTranslation(lng, 'case-converter');
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ModeKey>('upper');
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => transformText(input, mode), [input, mode]);

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
      console.error('Failed to copy output:', error);
    }
  };

  const handleClear = () => {
    setInput('');
  };

  return (
    <div className="space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="case-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.input')}
        </label>
        <Textarea
          id="case-input"
          className="min-h-[160px] font-mono"
          placeholder={t('placeholder')}
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('label.mode')}
        </span>
        <div className="flex flex-wrap gap-2">
          {modeKeys.map((key) => (
            <Button
              key={key}
              type="button"
              className={cn(
                'px-3 py-2 text-xs',
                mode === key ? 'bg-point-1 text-white' : 'bg-white',
              )}
              onClick={() => setMode(key)}
            >
              {t(`mode.${key}`)}
            </Button>
          ))}
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="case-output"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.output')}
          </label>
          <div className="flex items-center gap-2">
            <Button type="button" className="px-3 py-2 text-xs" onClick={handleClear}>
              {t('button.clear')}
            </Button>
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
        </div>
        <Textarea
          id="case-output"
          className="min-h-[160px] font-mono"
          value={output}
          readOnly
          placeholder={t('empty')}
        />
      </div>
    </div>
  );
}
