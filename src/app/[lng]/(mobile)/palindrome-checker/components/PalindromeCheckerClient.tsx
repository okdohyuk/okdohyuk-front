'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, Eraser } from 'lucide-react';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface PalindromeCheckerClientProps {
  lng: Language;
}

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '');

const formatCount = (count: number) => count.toLocaleString();

export default function PalindromeCheckerClient({ lng }: PalindromeCheckerClientProps) {
  const { t } = useTranslation(lng, 'palindrome-checker');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const normalized = useMemo(() => normalizeText(input), [input]);
  const reversed = useMemo(() => normalized.split('').reverse().join(''), [normalized]);
  const isPalindrome = normalized.length > 0 && normalized === reversed;

  useEffect(() => {
    setCopied(false);
  }, [normalized]);

  const handleCopy = async () => {
    if (!normalized) return;
    try {
      await navigator.clipboard.writeText(normalized);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy normalized text:', error);
    }
  };

  const statusLabel = useMemo(() => {
    if (normalized.length === 0) return t('status.empty');
    return isPalindrome ? t('status.palindrome') : t('status.notPalindrome');
  }, [isPalindrome, normalized.length, t]);

  const statusClassName = useMemo(() => {
    if (normalized.length === 0) {
      return 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    }

    return isPalindrome
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
      : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200';
  }, [isPalindrome, normalized.length]);

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="palindrome-input"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.input')}
          </label>
          <Button
            type="button"
            onClick={() => setInput('')}
            size="sm"
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!input}
          >
            <Eraser size={14} />
            {t('button.clear')}
          </Button>
        </div>
        <Textarea
          id="palindrome-input"
          placeholder={t('placeholder')}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={5}
          className="text-sm"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {t('label.result')}
          </h3>
          <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', statusClassName)}>
            {statusLabel}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="palindrome-normalized"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.normalized')}
            </label>
            <Button
              type="button"
              onClick={handleCopy}
              size="sm"
              className="flex items-center gap-2 px-3 py-2 text-xs"
              disabled={!normalized}
            >
              {copied ? <ClipboardCheck size={14} /> : <Clipboard size={14} />}
              {copied ? t('button.copied') : t('button.copy')}
            </Button>
          </div>
          <Textarea
            id="palindrome-normalized"
            readOnly
            value={normalized}
            placeholder={t('empty')}
            rows={3}
            className="text-sm"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('label.reversed')}
            </p>
            <Textarea
              readOnly
              value={reversed}
              placeholder={t('empty')}
              rows={3}
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('label.length')}
            </p>
            <div className="flex h-full items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-6 text-3xl font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
              {formatCount(normalized.length)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
