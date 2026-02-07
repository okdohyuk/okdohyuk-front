'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { Textarea } from '@components/basic/Textarea';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

type SortOrder = 'asc' | 'desc';

type LineSorterClientProps = {
  lng: Language;
};

const optionButtonClass = (active: boolean) =>
  cn(
    'rounded-md border px-3 py-2 text-xs font-medium transition-colors',
    active
      ? 'border-point-2 bg-point-2 text-white'
      : 'border-gray-200 bg-white text-gray-700 hover:border-point-2/60 hover:text-point-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200',
  );

export default function LineSorterClient({ lng }: LineSorterClientProps) {
  const { t } = useTranslation(lng, 'line-sorter');
  const [input, setInput] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [uniqueLines, setUniqueLines] = useState(true);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [copied, setCopied] = useState(false);

  const { output, inputCount, outputCount } = useMemo(() => {
    if (!input) {
      return { output: '', inputCount: 0, outputCount: 0 };
    }

    let lines = input.split(/\r?\n/);
    const inputCountValue = lines.length;

    if (trimWhitespace) {
      lines = lines.map((line) => line.trim());
    }

    if (removeEmpty) {
      lines = lines.filter((line) => line.length > 0);
    }

    if (uniqueLines) {
      const seen = new Set<string>();
      const deduped: string[] = [];
      lines.forEach((line) => {
        const key = ignoreCase ? line.toLowerCase() : line;
        if (seen.has(key)) return;
        seen.add(key);
        deduped.push(line);
      });
      lines = deduped;
    }

    const compare = (a: string, b: string) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: ignoreCase ? 'base' : 'variant',
      });

    lines.sort(compare);
    if (sortOrder === 'desc') {
      lines.reverse();
    }

    return {
      output: lines.join('\n'),
      inputCount: inputCountValue,
      outputCount: lines.length,
    };
  }, [input, trimWhitespace, removeEmpty, uniqueLines, ignoreCase, sortOrder]);

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
      console.error('Failed to copy sorted lines:', error);
    }
  };

  const handleClear = () => setInput('');

  const handleSample = () => setInput(t('example'));

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="line-sorter-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.input')}
        </label>
        <Textarea
          id="line-sorter-input"
          className="min-h-[140px] font-mono text-sm"
          placeholder={t('placeholder.input')}
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={handleSample} className="px-3 py-2 text-xs">
            {t('button.sample')}
          </Button>
          <Button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 text-xs"
            disabled={!input}
          >
            {t('button.clear')}
          </Button>
        </div>
        <Text variant="c1" color="basic-5" className="block">
          {t('helper')}
        </Text>
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span>
            {t('stats.input')}: {inputCount}
          </span>
          <span>
            {t('stats.output')}: {outputCount}
          </span>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <Text variant="d2" color="basic-2" className="block font-semibold">
            {t('label.sortOrder')}
          </Text>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={optionButtonClass(sortOrder === 'asc')}
              onClick={() => setSortOrder('asc')}
            >
              {t('option.ascending')}
            </button>
            <button
              type="button"
              className={optionButtonClass(sortOrder === 'desc')}
              onClick={() => setSortOrder('desc')}
            >
              {t('option.descending')}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Text variant="d2" color="basic-2" className="block font-semibold">
            {t('label.options')}
          </Text>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={optionButtonClass(trimWhitespace)}
              onClick={() => setTrimWhitespace((prev) => !prev)}
            >
              {t('option.trimWhitespace')}
            </button>
            <button
              type="button"
              className={optionButtonClass(removeEmpty)}
              onClick={() => setRemoveEmpty((prev) => !prev)}
            >
              {t('option.removeEmpty')}
            </button>
            <button
              type="button"
              className={optionButtonClass(uniqueLines)}
              onClick={() => setUniqueLines((prev) => !prev)}
            >
              {t('option.uniqueLines')}
            </button>
            <button
              type="button"
              className={optionButtonClass(ignoreCase)}
              onClick={() => setIgnoreCase((prev) => !prev)}
            >
              {t('option.ignoreCase')}
            </button>
          </div>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="line-sorter-output"
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
          id="line-sorter-output"
          className="min-h-[160px] font-mono text-sm"
          placeholder={t('placeholder.output')}
          value={output}
          readOnly
        />
        {!output && (
          <Text variant="c1" color="basic-5" className="block">
            {t('empty')}
          </Text>
        )}
      </div>
    </div>
  );
}
