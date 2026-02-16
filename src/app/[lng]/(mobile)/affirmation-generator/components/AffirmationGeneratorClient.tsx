'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Button } from '@components/basic/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { Copy, Sparkles } from 'lucide-react';

interface AffirmationGeneratorClientProps {
  lng: Language;
}

type AffirmationCategory = {
  label: string;
  description: string;
  items: string[];
};

export default function AffirmationGeneratorClient({ lng }: AffirmationGeneratorClientProps) {
  const { t } = useTranslation(lng, 'affirmation-generator');
  const categories = useMemo(
    () => t('categories', { returnObjects: true }) as Record<string, AffirmationCategory>,
    [t],
  );

  const categoryKeys = useMemo(() => Object.keys(categories), [categories]);
  const [category, setCategory] = useState(categoryKeys[0] ?? 'calm');
  const [affirmation, setAffirmation] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!categoryKeys.includes(category)) {
      setCategory(categoryKeys[0] ?? 'calm');
    }
  }, [categoryKeys, category]);

  const createAffirmation = useCallback(() => {
    const items = categories[category]?.items ?? [];
    if (items.length === 0) return;
    const next = items[Math.floor(Math.random() * items.length)];
    setAffirmation(next);
    setHistory((prev) => {
      const updated = [next, ...prev.filter((item) => item !== next)];
      return updated.slice(0, 5);
    });
    setCopied(false);
  }, [categories, category]);

  const handleCopy = async () => {
    if (!affirmation) return;
    try {
      await navigator.clipboard.writeText(affirmation);
      setCopied(true);
    } catch (error) {
      setCopied(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {t('label.category')}
          </p>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger aria-label={t('label.category')}>
              <SelectValue placeholder={t('placeholder.category')} />
            </SelectTrigger>
            <SelectContent>
              {categoryKeys.map((key) => (
                <SelectItem key={key} value={key}>
                  {categories[key]?.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {categories[category]?.description}
          </p>
        </div>
        <Button
          onClick={createAffirmation}
          className="w-full flex items-center justify-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {t('button.generate')}
        </Button>
      </section>

      <section
        className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-5 text-center')}
      >
        <div className="text-sm text-gray-500 dark:text-gray-400">{t('label.result')}</div>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 min-h-[48px]">
          {affirmation || t('empty')}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            onClick={handleCopy}
            disabled={!affirmation}
            className="flex items-center justify-center gap-2"
          >
            <Copy className="h-4 w-4" />
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
          <Button
            onClick={createAffirmation}
            className="bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            {t('button.again')}
          </Button>
        </div>
      </section>

      {history.length > 0 && (
        <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {t('label.history')}
          </p>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            {history.map((item) => (
              <li key={item} className="rounded-xl bg-white/70 p-3 dark:bg-gray-900/60">
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
