'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck } from 'lucide-react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Button } from '@components/basic/Button';
import { Text, H2 } from '@components/basic/Text';
import { Textarea } from '@components/basic/Textarea';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

type HeaderEntry = {
  key: string;
  value: string | string[];
};

type ParseResult = {
  headers: HeaderEntry[];
  invalidLines: string[];
  duplicateKeys: number;
  parsedCount: number;
  totalLines: number;
};

const normalizeHeaderKey = (key: string) =>
  key
    .toLowerCase()
    .split('-')
    .map((word) => (word ? `${word[0].toUpperCase()}${word.slice(1)}` : word))
    .join('-');

const buildCurlSnippet = (headers: HeaderEntry[]) => {
  if (!headers.length) return '';
  const headerLines = headers.flatMap(({ key, value }) => {
    if (Array.isArray(value)) {
      return value.map((item) => `-H "${key}: ${item}"`);
    }
    return [`-H "${key}: ${value}"`];
  });

  return `curl -X GET https://example.com \\\n  ${headerLines.join(' \\\n  ')}`;
};

interface HeaderToolboxClientProps {
  lng: Language;
}

export default function HeaderToolboxClient({ lng }: HeaderToolboxClientProps) {
  const { t } = useTranslation(lng, 'header-toolbox');
  const [rawHeaders, setRawHeaders] = useState(() => t('sample'));
  const [normalizeCase, setNormalizeCase] = useState(true);
  const [mergeDuplicates, setMergeDuplicates] = useState(true);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const parseResult = useMemo<ParseResult>(() => {
    const lines = rawHeaders.split(/\r?\n/);
    const invalidLines: string[] = [];
    const entries = new Map<string, string | string[]>();
    let duplicateKeys = 0;
    let parsedCount = 0;

    lines.forEach((line) => {
      const trimmedLine = trimWhitespace ? line.trim() : line;
      if (!trimmedLine) return;
      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex <= 0) {
        invalidLines.push(line);
        return;
      }
      let key = trimmedLine.slice(0, colonIndex).trim();
      let value = trimmedLine.slice(colonIndex + 1);
      if (trimWhitespace) {
        value = value.trim();
      }
      if (!key) {
        invalidLines.push(line);
        return;
      }
      if (normalizeCase) {
        key = normalizeHeaderKey(key);
      }

      if (entries.has(key)) {
        duplicateKeys += 1;
        const existing = entries.get(key);
        if (mergeDuplicates) {
          const merged = Array.isArray(existing)
            ? `${existing.join(', ')}, ${value}`
            : `${existing}, ${value}`;
          entries.set(key, merged);
        } else if (Array.isArray(existing)) {
          entries.set(key, [...existing, value]);
        } else {
          entries.set(key, [existing ?? '', value]);
        }
      } else {
        entries.set(key, value);
      }

      parsedCount += 1;
    });

    return {
      headers: Array.from(entries, ([key, value]) => ({ key, value })),
      invalidLines,
      duplicateKeys,
      parsedCount,
      totalLines: lines.length,
    };
  }, [rawHeaders, normalizeCase, mergeDuplicates, trimWhitespace]);

  const jsonOutput = useMemo(() => {
    if (!parseResult.headers.length) return '';
    const data = Object.fromEntries(parseResult.headers.map(({ key, value }) => [key, value]));
    return JSON.stringify(data, null, 2);
  }, [parseResult.headers]);

  const curlOutput = useMemo(() => buildCurlSnippet(parseResult.headers), [parseResult.headers]);

  const handleCopy = async (value: string, type: 'json' | 'curl') => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      if (type === 'json') {
        setCopiedJson(true);
      } else {
        setCopiedCurl(true);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy:', error);
    }
  };

  const handleSample = () => {
    setRawHeaders(t('sample'));
  };

  const handleClear = () => {
    setRawHeaders('');
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Text className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            {t('input.label')}
          </Text>
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="px-3 py-2 text-xs" onClick={handleSample}>
              {t('actions.sample')}
            </Button>
            <Button
              type="button"
              className="px-3 py-2 text-xs"
              onClick={handleClear}
              disabled={!rawHeaders}
            >
              {t('actions.clear')}
            </Button>
          </div>
        </div>
        <Textarea
          value={rawHeaders}
          onChange={(event) => {
            setRawHeaders(event.target.value);
            setCopiedJson(false);
            setCopiedCurl(false);
          }}
          className="min-h-[160px] font-mono text-sm"
          placeholder={t('input.placeholder')}
        />
        <Text className="text-xs text-zinc-500 dark:text-zinc-400">{t('input.helper')}</Text>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <H2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
          {t('options.title')}
        </H2>
        <div className="grid gap-3 text-sm text-zinc-700 dark:text-zinc-200">
          <label htmlFor="normalize-case" className="flex items-center gap-2">
            <input
              id="normalize-case"
              type="checkbox"
              className="h-4 w-4"
              checked={normalizeCase}
              onChange={(event) => setNormalizeCase(event.target.checked)}
            />
            {t('options.normalize')}
          </label>
          <label htmlFor="merge-duplicates" className="flex items-center gap-2">
            <input
              id="merge-duplicates"
              type="checkbox"
              className="h-4 w-4"
              checked={mergeDuplicates}
              onChange={(event) => setMergeDuplicates(event.target.checked)}
            />
            {t('options.merge')}
          </label>
          <label htmlFor="trim-whitespace" className="flex items-center gap-2">
            <input
              id="trim-whitespace"
              type="checkbox"
              className="h-4 w-4"
              checked={trimWhitespace}
              onChange={(event) => setTrimWhitespace(event.target.checked)}
            />
            {t('options.trim')}
          </label>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {t('stats.title')}
        </Text>
        <div className="grid grid-cols-2 gap-2 text-sm text-zinc-600 dark:text-zinc-300 sm:grid-cols-4">
          <div>
            <Text className="block text-xs uppercase tracking-wide text-zinc-400">
              {t('stats.total')}
            </Text>
            <Text className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
              {parseResult.totalLines}
            </Text>
          </div>
          <div>
            <Text className="block text-xs uppercase tracking-wide text-zinc-400">
              {t('stats.parsed')}
            </Text>
            <Text className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
              {parseResult.parsedCount}
            </Text>
          </div>
          <div>
            <Text className="block text-xs uppercase tracking-wide text-zinc-400">
              {t('stats.invalid')}
            </Text>
            <Text className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
              {parseResult.invalidLines.length}
            </Text>
          </div>
          <div>
            <Text className="block text-xs uppercase tracking-wide text-zinc-400">
              {t('stats.duplicates')}
            </Text>
            <Text className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
              {parseResult.duplicateKeys}
            </Text>
          </div>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-3 p-4')}>
        <div className="flex items-center justify-between gap-2">
          <Text className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            {t('output.json')}
          </Text>
          <Button
            type="button"
            className="flex items-center gap-2 px-3 py-2 text-xs"
            onClick={() => handleCopy(jsonOutput, 'json')}
            disabled={!jsonOutput}
          >
            {copiedJson ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copiedJson ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
        <Textarea
          value={jsonOutput}
          readOnly
          className="min-h-[160px] font-mono text-xs"
          placeholder={t('empty.json')}
        />
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-3 p-4')}>
        <div className="flex items-center justify-between gap-2">
          <Text className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            {t('output.curl')}
          </Text>
          <Button
            type="button"
            className="flex items-center gap-2 px-3 py-2 text-xs"
            onClick={() => handleCopy(curlOutput, 'curl')}
            disabled={!curlOutput}
          >
            {copiedCurl ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copiedCurl ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
        <Textarea
          value={curlOutput}
          readOnly
          className="min-h-[140px] font-mono text-xs"
          placeholder={t('empty.curl')}
        />
      </div>

      {parseResult.invalidLines.length ? (
        <div className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-4')}>
          <Text className="text-sm font-semibold text-rose-500">
            {t('errors.invalidLines')} ({parseResult.invalidLines.length})
          </Text>
          <ul className="list-disc space-y-1 pl-5 text-xs text-rose-400">
            {parseResult.invalidLines.slice(0, 5).map((line) => (
              <li key={line || 'invalid-line'}>{line || '-'}</li>
            ))}
          </ul>
          {parseResult.invalidLines.length > 5 ? (
            <Text className="text-xs text-rose-400">…</Text>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
