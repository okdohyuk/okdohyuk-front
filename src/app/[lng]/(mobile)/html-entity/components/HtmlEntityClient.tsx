'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, RefreshCcw, Trash2 } from 'lucide-react';
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

interface HtmlEntityClientProps {
  lng: Language;
}

type Mode = 'encode' | 'decode';

const encodeHtml = (value: string, encodeNonAscii: boolean) =>
  Array.from(value)
    .map((char) => {
      const code = char.charCodeAt(0);
      if (char === '&') return '&amp;';
      if (char === '<') return '&lt;';
      if (char === '>') return '&gt;';
      if (char === '"') return '&quot;';
      if (char === "'") return '&#39;';
      if (encodeNonAscii && code > 127) return `&#${code};`;
      return char;
    })
    .join('');

const decodeHtml = (value: string) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
};

export default function HtmlEntityClient({ lng }: HtmlEntityClientProps) {
  const { t } = useTranslation(lng, 'html-entity');
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('');
  const [encodeNonAscii, setEncodeNonAscii] = useState(false);
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!input) return '';
    if (mode === 'encode') return encodeHtml(input, encodeNonAscii);
    return decodeHtml(input);
  }, [input, mode, encodeNonAscii]);

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
      console.error('Failed to copy HTML entities:', error);
    }
  };

  const handleSwap = () => {
    if (!output) return;
    setInput(output);
    setMode((prev) => (prev === 'encode' ? 'decode' : 'encode'));
  };

  const handleExample = () => {
    if (mode === 'encode') {
      setInput('<div class="note">Hello & 안녕</div>');
    } else {
      setInput('&lt;div class=&quot;note&quot;&gt;Hello &amp; 안녕&lt;/div&gt;');
    }
  };

  return (
    <div className="space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center gap-3">
          <Text variant="d3" color="basic-4">
            {t('label.mode')}
          </Text>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setMode('encode')}
              className={cn(
                'px-4 py-2 text-sm',
                mode === 'encode'
                  ? 'bg-point-2 text-white'
                  : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200',
              )}
            >
              {t('button.encode')}
            </Button>
            <Button
              type="button"
              onClick={() => setMode('decode')}
              className={cn(
                'px-4 py-2 text-sm',
                mode === 'decode'
                  ? 'bg-point-2 text-white'
                  : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200',
              )}
            >
              {t('button.decode')}
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <input
            id="html-entity-nonascii"
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-300 text-point-1 focus:ring-point-1"
            checked={encodeNonAscii}
            onChange={(event) => setEncodeNonAscii(event.target.checked)}
            disabled={mode !== 'encode'}
          />
          <label htmlFor="html-entity-nonascii">{t('option.nonAscii')}</label>
        </div>
        <Text variant="c1" color="basic-5">
          {mode === 'encode' ? t('helper.encode') : t('helper.decode')}
        </Text>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="html-entity-input"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-200"
        >
          {t('label.input')}
        </label>
        <Textarea
          id="html-entity-input"
          className="min-h-[140px] font-mono text-sm"
          placeholder={t('placeholder')}
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
          <span>
            {t('label.length')}: {input.length}
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={handleExample}
              className="bg-zinc-100 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {t('button.example')}
            </Button>
            <Button
              type="button"
              onClick={() => setInput('')}
              className="flex items-center gap-1 bg-zinc-100 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <Trash2 size={14} />
              {t('button.clear')}
            </Button>
          </div>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label
            htmlFor="html-entity-output"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-200"
          >
            {t('label.output')}
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={handleSwap}
              className="flex items-center gap-1 bg-zinc-100 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200"
              disabled={!output}
            >
              <RefreshCcw size={14} />
              {t('button.swap')}
            </Button>
            <Button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-2 text-xs"
              disabled={!output}
            >
              {copied ? <ClipboardCheck size={14} /> : <Clipboard size={14} />}
              {copied ? t('button.copied') : t('button.copy')}
            </Button>
          </div>
        </div>
        <Textarea
          id="html-entity-output"
          className="min-h-[140px] font-mono text-sm"
          value={output}
          readOnly
          placeholder={t('empty')}
        />
      </section>
    </div>
  );
}
