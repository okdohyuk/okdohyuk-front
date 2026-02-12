'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck } from 'lucide-react';
import { TFunction } from 'i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select/Select';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';

interface CaseConverterPanelProps {
  t: TFunction<'text-toolkit', undefined>;
}

type CaseMode = 'upper' | 'lower' | 'title' | 'sentence' | 'camel';

const toTitleCase = (input: string) =>
  input.toLowerCase().replace(/\b([a-z\p{L}])/giu, (match) => match.toUpperCase());

const toSentenceCase = (input: string) => {
  const lower = input.toLowerCase();
  return lower.replace(/(^\s*[\p{L}])|([.!?]\s+[\p{L}])/gu, (match) => match.toUpperCase());
};

const toCamelCase = (input: string) => {
  const parts = input
    .trim()
    .split(/[^\p{L}\p{N}]+/gu)
    .filter(Boolean);
  if (!parts.length) return '';
  return (
    parts[0].toLowerCase() +
    parts
      .slice(1)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('')
  );
};

export default function CaseConverterPanel({ t }: CaseConverterPanelProps) {
  const [value, setValue] = useState('');
  const [mode, setMode] = useState<CaseMode>('upper');
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!value) return '';
    switch (mode) {
      case 'lower':
        return value.toLowerCase();
      case 'title':
        return toTitleCase(value);
      case 'sentence':
        return toSentenceCase(value);
      case 'camel':
        return toCamelCase(value);
      case 'upper':
      default:
        return value.toUpperCase();
    }
  }, [mode, value]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy converted text:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {t('case.title')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('case.description')}</p>
      </div>
      <div className="space-y-2">
        <label
          htmlFor="text-toolkit-case-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('case.label.input')}
        </label>
        <Textarea
          id="text-toolkit-case-input"
          className="min-h-[120px]"
          placeholder={t('case.placeholder')}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="text-toolkit-case-mode"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('case.label.mode')}
        </label>
        <Select value={mode} onValueChange={(nextValue) => setMode(nextValue as CaseMode)}>
          <SelectTrigger id="text-toolkit-case-mode" aria-label={t('case.label.mode')}>
            <SelectValue placeholder={t('case.placeholderMode')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upper">{t('case.mode.upper')}</SelectItem>
            <SelectItem value="lower">{t('case.mode.lower')}</SelectItem>
            <SelectItem value="title">{t('case.mode.title')}</SelectItem>
            <SelectItem value="sentence">{t('case.mode.sentence')}</SelectItem>
            <SelectItem value="camel">{t('case.mode.camel')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="text-toolkit-case-output"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('case.label.output')}
          </label>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!output}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('case.button.copied') : t('case.button.copy')}
          </Button>
        </div>
        <Textarea
          id="text-toolkit-case-output"
          className="min-h-[120px] font-mono"
          value={output}
          readOnly
          placeholder={t('case.empty')}
        />
      </div>
    </div>
  );
}
