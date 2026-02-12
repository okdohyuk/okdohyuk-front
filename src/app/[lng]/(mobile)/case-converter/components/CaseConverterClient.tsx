'use client';

import React, { useMemo, useState } from 'react';
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

interface CaseConverterClientProps {
  lng: Language;
}

type CaseItem = {
  id: string;
  label: string;
  value: string;
};

const splitWords = (value: string) => {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
};

const capitalize = (word: string) => {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

const toSentenceCase = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export default function CaseConverterClient({ lng }: CaseConverterClientProps) {
  const { t } = useTranslation(lng, 'case-converter');
  const [text, setText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const cases = useMemo<CaseItem[]>(() => {
    if (!text) {
      return [];
    }

    const words = splitWords(text);
    const lowerWords = words.map((word) => word.toLowerCase());
    const upperWords = words.map((word) => word.toUpperCase());

    const camel = lowerWords.map((word, index) => (index === 0 ? word : capitalize(word))).join('');
    const pascal = lowerWords.map(capitalize).join('');
    const snake = lowerWords.join('_');
    const kebab = lowerWords.join('-');
    const title = words.map(capitalize).join(' ');
    const sentence = toSentenceCase(text);

    return [
      { id: 'upper', label: t('cases.upper'), value: upperWords.join(' ') },
      { id: 'lower', label: t('cases.lower'), value: lowerWords.join(' ') },
      { id: 'title', label: t('cases.title'), value: title },
      { id: 'sentence', label: t('cases.sentence'), value: sentence },
      { id: 'camel', label: t('cases.camel'), value: camel },
      { id: 'pascal', label: t('cases.pascal'), value: pascal },
      { id: 'snake', label: t('cases.snake'), value: snake },
      { id: 'kebab', label: t('cases.kebab'), value: kebab },
    ];
  }, [text, t]);

  const handleCopy = async (value: string, id: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="case-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.input')}
        </label>
        <Textarea
          id="case-input"
          className="min-h-[160px] resize-none"
          placeholder={t('placeholder')}
          value={text}
          onChange={(event) => {
            setCopiedId(null);
            setText(event.target.value);
          }}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {t('label.output')}
          </h2>
        </div>
        {cases.length === 0 ? (
          <div className={cn(SERVICE_PANEL_SOFT, 'p-4 text-sm text-gray-500 dark:text-gray-400')}>
            {t('empty')}
          </div>
        ) : (
          <div className="grid gap-3">
            {cases.map((item) => (
              <div
                key={item.id}
                className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-3 p-4')}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    {item.label}
                  </span>
                  <Button
                    type="button"
                    onClick={() => handleCopy(item.value, item.id)}
                    className="flex items-center gap-2 px-3 py-2 text-xs"
                  >
                    {copiedId === item.id ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
                    {copiedId === item.id ? t('button.copied') : t('button.copy')}
                  </Button>
                </div>
                <Textarea
                  className="min-h-[70px] resize-none font-mono"
                  value={item.value}
                  readOnly
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
