'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, Eraser, Sparkles } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Textarea } from '@components/basic/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

const DELIMITERS = [
  { value: 'comma', symbol: ',', labelKey: 'delimiter.comma' },
  { value: 'tab', symbol: '\t', labelKey: 'delimiter.tab' },
  { value: 'pipe', symbol: '|', labelKey: 'delimiter.pipe' },
  { value: 'semicolon', symbol: ';', labelKey: 'delimiter.semicolon' },
] as const;

type DelimiterValue = (typeof DELIMITERS)[number]['value'];

type AlignmentValue = 'left' | 'center' | 'right';

const ALIGNMENT_MAP: Record<AlignmentValue, string> = {
  left: ':---',
  center: ':---:',
  right: '---:',
};

const EXAMPLE_INPUT = [
  'Name,Role,Note',
  'Amadeus,AI,Reasoning data-based',
  'Kurisu,Human,Original memory',
].join('\n');

const escapeCell = (value: string) => value.replace(/\|/g, '\\|');

const normalizeRows = (rows: string[][], columnCount: number) => {
  return rows.map((row) => {
    const normalized = [...row];
    while (normalized.length < columnCount) {
      normalized.push('');
    }
    return normalized;
  });
};

const buildMarkdownTable = (
  rows: string[][],
  options: {
    includeHeader: boolean;
    alignment: AlignmentValue;
    headerFallbackPrefix: string;
  },
) => {
  if (!rows.length) return '';

  const columnCount = Math.max(...rows.map((row) => row.length));
  if (columnCount === 0) return '';

  const safeRows = normalizeRows(rows, columnCount);
  const [firstRow, ...bodyRows] = safeRows;

  const headerRow = options.includeHeader
    ? firstRow
    : Array.from(
        { length: columnCount },
        (_, index) => `${options.headerFallbackPrefix} ${index + 1}`,
      );

  const dataRows = options.includeHeader ? bodyRows : safeRows;

  const headerLine = `| ${headerRow.map((cell) => escapeCell(cell)).join(' | ')} |`;
  const alignLine = `| ${Array.from({ length: columnCount })
    .map(() => ALIGNMENT_MAP[options.alignment])
    .join(' | ')} |`;
  const bodyLines = dataRows.map((row) => `| ${row.map((cell) => escapeCell(cell)).join(' | ')} |`);

  return [headerLine, alignLine, ...bodyLines].join('\n');
};

const parseInput = (raw: string, delimiter: DelimiterValue) => {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const delimiterSymbol = DELIMITERS.find((item) => item.value === delimiter)?.symbol ?? ',';

  return trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      if (delimiter === 'pipe') {
        const sanitized = line.replace(/^\s*\|/, '').replace(/\|\s*$/, '');
        return sanitized.split('|').map((cell) => cell.trim());
      }

      return line.split(delimiterSymbol).map((cell) => cell.trim());
    });
};

interface MarkdownTableGeneratorClientProps {
  lng: Language;
}

export default function MarkdownTableGeneratorClient({ lng }: MarkdownTableGeneratorClientProps) {
  const { t } = useTranslation(lng, 'markdown-table-generator');
  const [input, setInput] = useState('');
  const [delimiter, setDelimiter] = useState<DelimiterValue>('comma');
  const [alignment, setAlignment] = useState<AlignmentValue>('left');
  const [useHeader, setUseHeader] = useState(true);
  const [copied, setCopied] = useState(false);

  const rows = useMemo(() => parseInput(input, delimiter), [input, delimiter]);
  const output = useMemo(
    () =>
      buildMarkdownTable(rows, {
        includeHeader: useHeader,
        alignment,
        headerFallbackPrefix: t('header.fallback'),
      }),
    [rows, useHeader, alignment, t],
  );

  useEffect(() => {
    setCopied(false);
  }, [output]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy markdown table:', error);
    }
  };

  const handleClear = () => {
    setInput('');
    setCopied(false);
  };

  const handleExample = () => {
    setInput(EXAMPLE_INPUT);
    setDelimiter('comma');
    setUseHeader(true);
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <Text variant="d2" className="font-semibold text-gray-800 dark:text-gray-100">
            {t('label.input')}
          </Text>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handleExample}
              className="flex items-center gap-2 px-3 py-2 text-xs"
            >
              <Sparkles size={16} />
              {t('button.example')}
            </Button>
            <Button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-2 px-3 py-2 text-xs"
              disabled={!input}
              variant="secondary"
            >
              <Eraser size={16} />
              {t('button.clear')}
            </Button>
          </div>
        </div>
        <Textarea
          id="markdown-table-input"
          className="min-h-[180px] font-mono text-sm"
          placeholder={t('placeholder.input')}
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text variant="d2" className="font-semibold text-gray-800 dark:text-gray-100">
          {t('label.options')}
        </Text>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label
              htmlFor="markdown-table-delimiter"
              className="text-xs font-medium text-gray-600 dark:text-gray-300"
            >
              {t('label.delimiter')}
            </label>
            <Select
              value={delimiter}
              onValueChange={(value) => setDelimiter(value as DelimiterValue)}
            >
              <SelectTrigger id="markdown-table-delimiter">
                <SelectValue placeholder={t('placeholder.delimiter')} />
              </SelectTrigger>
              <SelectContent>
                {DELIMITERS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {t(item.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="markdown-table-alignment"
              className="text-xs font-medium text-gray-600 dark:text-gray-300"
            >
              {t('label.alignment')}
            </label>
            <Select
              value={alignment}
              onValueChange={(value) => setAlignment(value as AlignmentValue)}
            >
              <SelectTrigger id="markdown-table-alignment">
                <SelectValue placeholder={t('placeholder.alignment')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">{t('alignment.left')}</SelectItem>
                <SelectItem value="center">{t('alignment.center')}</SelectItem>
                <SelectItem value="right">{t('alignment.right')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {t('label.header')}
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700">
              <input
                id="markdown-header-toggle"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-point-1 focus:ring-point-1 dark:border-gray-600"
                checked={useHeader}
                onChange={(event) => setUseHeader(event.target.checked)}
              />
              <label
                htmlFor="markdown-header-toggle"
                className="text-sm text-gray-700 dark:text-gray-200"
              >
                {t('header.useFirstRow')}
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-3 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <Text variant="d2" className="font-semibold text-gray-800 dark:text-gray-100">
            {t('label.output')}
          </Text>
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
          id="markdown-table-output"
          className="min-h-[160px] font-mono text-sm"
          value={output}
          readOnly
          placeholder={t('empty')}
        />
        {!rows.length && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('emptyHelper')}</p>
        )}
      </div>
    </div>
  );
}
