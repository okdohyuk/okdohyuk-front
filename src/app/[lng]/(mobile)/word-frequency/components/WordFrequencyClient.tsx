'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, Eraser, Sparkles } from 'lucide-react';
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

interface WordFrequencyClientProps {
  lng: Language;
}

type SortOption = 'frequency' | 'alphabetical';

type CaseOption = 'lower' | 'keep';

const LIMIT_OPTIONS = [10, 20, 50];
const MIN_LENGTH_OPTIONS = [1, 2, 3, 4];

const extractWords = (value: string) => value.match(/[\p{L}\p{N}']+/gu) ?? [];

export default function WordFrequencyClient({ lng }: WordFrequencyClientProps) {
  const { t } = useTranslation(lng, 'word-frequency');
  const [value, setValue] = useState('');
  const [limit, setLimit] = useState(LIMIT_OPTIONS[1]);
  const [minLength, setMinLength] = useState(MIN_LENGTH_OPTIONS[1]);
  const [sortBy, setSortBy] = useState<SortOption>('frequency');
  const [caseMode, setCaseMode] = useState<CaseOption>('lower');
  const [copied, setCopied] = useState(false);

  const { rows, totalWords, uniqueWords } = useMemo(() => {
    const tokens = extractWords(value);
    const filtered = tokens
      .map((token) => (caseMode === 'lower' ? token.toLowerCase() : token))
      .filter((token) => token.length >= minLength);

    const counter = new Map<string, number>();
    filtered.forEach((token) => {
      counter.set(token, (counter.get(token) ?? 0) + 1);
    });

    const entries = Array.from(counter.entries()).map(([word, count]) => ({ word, count }));

    entries.sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.word.localeCompare(b.word);
      }
      if (b.count === a.count) {
        return a.word.localeCompare(b.word);
      }
      return b.count - a.count;
    });

    return {
      rows: entries.slice(0, limit),
      totalWords: filtered.length,
      uniqueWords: entries.length,
    };
  }, [value, limit, minLength, sortBy, caseMode]);

  useEffect(() => {
    setCopied(false);
  }, [rows]);

  const handleCopy = async () => {
    if (!rows.length) return;
    const payload = rows.map((row) => `${row.word},${row.count}`).join('\n');
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy frequency list:', error);
    }
  };

  const handleClear = () => {
    setValue('');
    setCopied(false);
  };

  const handleSample = () => {
    setValue(t('sample'));
    setCopied(false);
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="word-frequency-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.input')}
        </label>
        <Textarea
          id="word-frequency-input"
          className="min-h-[160px] text-sm"
          placeholder={t('placeholder')}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={handleSample} className="gap-2 px-3 py-2 text-xs">
            <Sparkles size={16} />
            {t('button.sample')}
          </Button>
          <Button type="button" onClick={handleClear} className="gap-2 px-3 py-2 text-xs">
            <Eraser size={16} />
            {t('button.clear')}
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('label.sort')}
            </p>
            <Select value={sortBy} onValueChange={(next) => setSortBy(next as SortOption)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder={t('option.frequency')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frequency">{t('option.frequency')}</SelectItem>
                <SelectItem value="alphabetical">{t('option.alphabetical')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('label.case')}
            </p>
            <Select value={caseMode} onValueChange={(next) => setCaseMode(next as CaseOption)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder={t('option.lower')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lower">{t('option.lower')}</SelectItem>
                <SelectItem value="keep">{t('option.keep')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('label.minLength')}
            </p>
            <Select value={String(minLength)} onValueChange={(next) => setMinLength(Number(next))}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder={String(minLength)} />
              </SelectTrigger>
              <SelectContent>
                {MIN_LENGTH_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {t('option.minLength', { count: option })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('label.limit')}
            </p>
            <Select value={String(limit)} onValueChange={(next) => setLimit(Number(next))}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder={String(limit)} />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {t('option.limit', { count: option })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-300">
          <span>{t('stats.total', { count: totalWords })}</span>
          <span>{t('stats.unique', { count: uniqueWords })}</span>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('label.results')}
          </p>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!rows.length}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
        {rows.length ? (
          <div className="space-y-2">
            {rows.map((row) => (
              <div
                key={row.word}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <span className="font-medium">{row.word}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('empty')}</p>
        )}
      </div>
    </div>
  );
}
