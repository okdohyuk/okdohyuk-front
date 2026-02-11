'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck } from 'lucide-react';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
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

interface TextCaseClientProps {
  lng: Language;
}

type CaseFormat = 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'snake' | 'kebab';

const toTitleCase = (tokens: string[]) =>
  tokens
    .map((token) => {
      const lower = token.toLowerCase();
      return lower ? `${lower[0].toUpperCase()}${lower.slice(1)}` : lower;
    })
    .join(' ');

const toCamelCase = (tokens: string[]) => {
  if (!tokens.length) return '';
  const [first, ...rest] = tokens;
  return `${first.toLowerCase()}${toTitleCase(rest).replace(/\s+/g, '')}`;
};

const normalizeTokens = (value: string) =>
  value
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

const convertCase = (value: string, format: CaseFormat) => {
  if (!value.trim()) return '';
  switch (format) {
    case 'upper':
      return value.toUpperCase();
    case 'lower':
      return value.toLowerCase();
    case 'title':
      return toTitleCase(normalizeTokens(value));
    case 'sentence': {
      const lower = value.trim().toLowerCase();
      return lower ? `${lower[0].toUpperCase()}${lower.slice(1)}` : '';
    }
    case 'camel':
      return toCamelCase(normalizeTokens(value));
    case 'snake':
      return normalizeTokens(value)
        .map((token) => token.toLowerCase())
        .join('_');
    case 'kebab':
      return normalizeTokens(value)
        .map((token) => token.toLowerCase())
        .join('-');
    default:
      return value;
  }
};

export default function TextCaseClient({ lng }: TextCaseClientProps) {
  const { t } = useTranslation(lng, 'text-case');
  const [value, setValue] = useState('');
  const [format, setFormat] = useState<CaseFormat>('upper');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => convertCase(value, format), [value, format]);

  useEffect(() => {
    setCopied(false);
  }, [result]);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="text-case-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.input')}
        </label>
        <Textarea
          id="text-case-input"
          className="min-h-[140px]"
          placeholder={t('placeholder')}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="text-case-format"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.format')}
        </label>
        <Select value={format} onValueChange={(next) => setFormat(next as CaseFormat)}>
          <SelectTrigger id="text-case-format">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upper">{t('case.upper')}</SelectItem>
            <SelectItem value="lower">{t('case.lower')}</SelectItem>
            <SelectItem value="title">{t('case.title')}</SelectItem>
            <SelectItem value="sentence">{t('case.sentence')}</SelectItem>
            <SelectItem value="camel">{t('case.camel')}</SelectItem>
            <SelectItem value="snake">{t('case.snake')}</SelectItem>
            <SelectItem value="kebab">{t('case.kebab')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="text-case-output"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.output')}
          </label>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!result}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
        <Textarea
          id="text-case-output"
          className="min-h-[140px]"
          value={result}
          readOnly
          placeholder={t('empty')}
        />
      </div>
    </div>
  );
}
