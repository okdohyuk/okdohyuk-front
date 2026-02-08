'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, Eraser, Sparkles } from 'lucide-react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/basic/Table';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

type UrlParserClientProps = {
  lng: Language;
};

type ParsedState = {
  url: URL | null;
  error: string | null;
};

const SAMPLE_URL =
  'https://user:pass@example.com:8080/path/name?utm_source=chatgpt&ref=home#section-2';

export default function UrlParserClient({ lng }: UrlParserClientProps) {
  const { t } = useTranslation(lng, 'url-parser');
  const [value, setValue] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const parsed = useMemo<ParsedState>(() => {
    const trimmed = value.trim();
    if (!trimmed) {
      return { url: null, error: null, usedFallback: false };
    }

    try {
      return { url: new URL(trimmed), error: null, usedFallback: false };
    } catch (error) {
      try {
        return { url: new URL(`https://${trimmed}`), error: null, usedFallback: true };
      } catch (fallbackError) {
        return { url: null, error: t('error.invalid'), usedFallback: false };
      }
    }
  }, [t, value]);

  useEffect(() => {
    setCopiedKey(null);
  }, [value]);

  const handleCopy = async (text: string, key: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy URL field:', error);
    }
  };

  const handleCopyAll = async () => {
    if (!parsed.url) return;
    const payload = {
      href: parsed.url.href,
      origin: parsed.url.origin,
      protocol: parsed.url.protocol,
      host: parsed.url.host,
      hostname: parsed.url.hostname,
      port: parsed.url.port,
      pathname: parsed.url.pathname,
      search: parsed.url.search,
      hash: parsed.url.hash,
      username: parsed.url.username,
      password: parsed.url.password,
      params: Object.fromEntries(parsed.url.searchParams.entries()),
    };

    await handleCopy(JSON.stringify(payload, null, 2), 'all');
  };

  const fields = parsed.url
    ? [
        { key: 'href', value: parsed.url.href },
        { key: 'origin', value: parsed.url.origin },
        { key: 'protocol', value: parsed.url.protocol },
        { key: 'host', value: parsed.url.host },
        { key: 'hostname', value: parsed.url.hostname },
        { key: 'port', value: parsed.url.port },
        { key: 'pathname', value: parsed.url.pathname },
        { key: 'search', value: parsed.url.search },
        { key: 'hash', value: parsed.url.hash },
        { key: 'username', value: parsed.url.username },
        { key: 'password', value: parsed.url.password },
      ]
    : [];

  const queryParams = parsed.url ? Array.from(parsed.url.searchParams.entries()) : [];

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label
            htmlFor="url-input"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.input')}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={() => setValue(SAMPLE_URL)}
              className="flex items-center gap-2 px-3 py-2 text-xs"
            >
              <Sparkles size={16} />
              {t('button.sample')}
            </Button>
            <Button
              type="button"
              onClick={() => setValue('')}
              className="flex items-center gap-2 px-3 py-2 text-xs bg-zinc-500 hover:bg-zinc-600"
            >
              <Eraser size={16} />
              {t('button.clear')}
            </Button>
          </div>
        </div>
        <Textarea
          id="url-input"
          rows={3}
          className="font-mono"
          placeholder="https://example.com/path?utm_source=app"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <Text variant="c1" color="basic-5">
          {t('helper')}
        </Text>
        {parsed.error ? (
          <Text variant="d3" className="text-rose-500">
            {parsed.error}
          </Text>
        ) : null}
        {parsed.usedFallback ? (
          <Text variant="c1" className="text-amber-500">
            {t('notice.fallback')}
          </Text>
        ) : null}
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Text variant="d2" className="font-semibold text-gray-700 dark:text-gray-300">
            {t('label.output')}
          </Text>
          <Button
            type="button"
            onClick={handleCopyAll}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!parsed.url}
          >
            {copiedKey === 'all' ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copiedKey === 'all' ? t('button.copied') : t('button.copyAll')}
          </Button>
        </div>
        {!parsed.url && !parsed.error ? (
          <Text variant="d3" color="basic-5">
            {t('empty')}
          </Text>
        ) : null}
        {parsed.url ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Text variant="d3" className="font-medium text-gray-700 dark:text-gray-300">
                    {t(`fields.${field.key}`)}
                  </Text>
                  <Button
                    type="button"
                    onClick={() => handleCopy(field.value, field.key)}
                    className="flex items-center gap-2 px-3 py-2 text-xs"
                    disabled={!field.value}
                  >
                    {copiedKey === field.key ? (
                      <ClipboardCheck size={16} />
                    ) : (
                      <Clipboard size={16} />
                    )}
                    {copiedKey === field.key ? t('button.copied') : t('button.copy')}
                  </Button>
                </div>
                <Input className="font-mono" value={field.value} readOnly />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text variant="d2" className="font-semibold text-gray-700 dark:text-gray-300">
          {t('label.queryParams')}
        </Text>
        {queryParams.length === 0 ? (
          <Text variant="d3" color="basic-5">
            {t('empty')}
          </Text>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queryParams.map(([key, paramValue]) => (
                <TableRow key={`${key}-${paramValue}`}>
                  <TableCell className="font-mono text-xs">{key}</TableCell>
                  <TableCell className="font-mono text-xs">{paramValue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
