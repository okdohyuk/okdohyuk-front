'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck } from 'lucide-react';
import { TFunction } from 'i18next';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select/Select';

interface LineOrganizerPanelProps {
  t: TFunction<'text-toolkit', undefined>;
}

type SortOrder = 'keep' | 'asc' | 'desc';

export default function LineOrganizerPanel({ t }: LineOrganizerPanelProps) {
  const [value, setValue] = useState('');
  const [trimLines, setTrimLines] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [uniqueLines, setUniqueLines] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('keep');
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    const rawLines = value.split(/\r?\n/);
    let lines = rawLines.map((line) => (trimLines ? line.trim() : line));

    if (removeEmpty) {
      lines = lines.filter((line) => line.length > 0);
    }

    if (uniqueLines) {
      const seen = new Set<string>();
      lines = lines.filter((line) => {
        if (seen.has(line)) return false;
        seen.add(line);
        return true;
      });
    }

    if (sortOrder !== 'keep') {
      lines = [...lines].sort((a, b) => a.localeCompare(b));
      if (sortOrder === 'desc') {
        lines = lines.reverse();
      }
    }

    return lines.join('\n');
  }, [removeEmpty, sortOrder, trimLines, uniqueLines, value]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy line output:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {t('lines.title')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('lines.description')}</p>
      </div>
      <div className="space-y-2">
        <label
          htmlFor="text-toolkit-lines-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('lines.label.input')}
        </label>
        <Textarea
          id="text-toolkit-lines-input"
          className="min-h-[120px]"
          placeholder={t('lines.placeholder')}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="text-toolkit-lines-sort"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('lines.label.sort')}
          </label>
          <Select
            value={sortOrder}
            onValueChange={(nextValue) => setSortOrder(nextValue as SortOrder)}
          >
            <SelectTrigger id="text-toolkit-lines-sort" aria-label={t('lines.label.sort')}>
              <SelectValue placeholder={t('lines.sort.keep')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="keep">{t('lines.sort.keep')}</SelectItem>
              <SelectItem value="asc">{t('lines.sort.asc')}</SelectItem>
              <SelectItem value="desc">{t('lines.sort.desc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('lines.label.options')}
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                id="text-toolkit-option-trim"
                type="checkbox"
                checked={trimLines}
                onChange={() => setTrimLines((prev) => !prev)}
                className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-point-1 focus:ring-2 focus:ring-point-1 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
              />
              <label htmlFor="text-toolkit-option-trim">{t('lines.option.trim')}</label>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                id="text-toolkit-option-remove-empty"
                type="checkbox"
                checked={removeEmpty}
                onChange={() => setRemoveEmpty((prev) => !prev)}
                className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-point-1 focus:ring-2 focus:ring-point-1 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
              />
              <label htmlFor="text-toolkit-option-remove-empty">
                {t('lines.option.removeEmpty')}
              </label>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                id="text-toolkit-option-unique"
                type="checkbox"
                checked={uniqueLines}
                onChange={() => setUniqueLines((prev) => !prev)}
                className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-point-1 focus:ring-2 focus:ring-point-1 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
              />
              <label htmlFor="text-toolkit-option-unique">{t('lines.option.unique')}</label>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="text-toolkit-lines-output"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('lines.label.output')}
          </label>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!output}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('lines.button.copied') : t('lines.button.copy')}
          </Button>
        </div>
        <Textarea
          id="text-toolkit-lines-output"
          className="min-h-[120px] font-mono"
          value={output}
          readOnly
          placeholder={t('lines.empty')}
        />
      </div>
    </div>
  );
}
