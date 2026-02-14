'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck } from 'lucide-react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
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

type OutputKey = 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'snake';

const capitalizeWord = (word: string) => {
  if (!word) return '';
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
};

const toTitleCase = (value: string) =>
  value
    .split(' ')
    .map((word) => capitalizeWord(word.toLowerCase()))
    .join(' ');

const toSentenceCase = (value: string) => {
  const lower = value.toLowerCase();
  if (!lower) return '';
  return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
};

export default function CaseConverterClient({ lng }: CaseConverterClientProps) {
  const { t } = useTranslation(lng, 'case-converter');
  const [value, setValue] = useState('');
  const [copiedKey, setCopiedKey] = useState<OutputKey | null>(null);

  const normalized = useMemo(() => value.replace(/\s+/g, ' ').trim(), [value]);
  const words = useMemo(
    () => (normalized ? normalized.split(/[\s_-]+/).filter(Boolean) : []),
    [normalized],
  );

  const outputs = useMemo(() => {
    const lowerWords = words.map((word) => word.toLowerCase());
    const title = toTitleCase(normalized);
    const sentence = toSentenceCase(normalized);
    const camel = lowerWords
      .map((word, index) => (index === 0 ? word : capitalizeWord(word)))
      .join('');
    const snake = lowerWords.join('_');

    return {
      upper: normalized.toUpperCase(),
      lower: normalized.toLowerCase(),
      title,
      sentence,
      camel,
      snake,
    } satisfies Record<OutputKey, string>;
  }, [normalized, words]);

  useEffect(() => {
    setCopiedKey(null);
  }, [normalized]);

  const handleCopy = async (key: OutputKey, text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy text:', error);
    }
  };

  const outputItems: Array<{ key: OutputKey; label: string; value: string }> = [
    { key: 'upper', label: t('output.upper'), value: outputs.upper },
    { key: 'lower', label: t('output.lower'), value: outputs.lower },
    { key: 'title', label: t('output.title'), value: outputs.title },
    { key: 'sentence', label: t('output.sentence'), value: outputs.sentence },
    { key: 'camel', label: t('output.camel'), value: outputs.camel },
    { key: 'snake', label: t('output.snake'), value: outputs.snake },
  ];

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="case-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.input')}
        </label>
        <Input
          id="case-input"
          className="font-mono"
          placeholder={t('placeholder')}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('label.outputs')}</p>
        <div className="space-y-4">
          {outputItems.map((item) => (
            <div key={item.key} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {item.label}
                </span>
                <Button
                  type="button"
                  onClick={() => handleCopy(item.key, item.value)}
                  className="flex items-center gap-2 px-3 py-2 text-xs"
                  disabled={!item.value}
                >
                  {copiedKey === item.key ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
                  {copiedKey === item.key ? t('button.copied') : t('button.copy')}
                </Button>
              </div>
              <Input className="font-mono" value={item.value} readOnly placeholder={t('empty')} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
