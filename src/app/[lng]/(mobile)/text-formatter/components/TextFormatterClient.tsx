'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Textarea } from '@components/basic/Textarea';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface TextFormatterClientProps {
  lng: Language;
}

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .replace(
      /(^|[\s_-])(\p{L})/gu,
      (match, separator, letter) => `${separator}${letter.toUpperCase()}`,
    );

export default function TextFormatterClient({ lng }: TextFormatterClientProps) {
  const { t } = useTranslation(lng, 'text-formatter');
  const [value, setValue] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const computed = useMemo(() => {
    const trimmed = value.trim();
    const lines = value.split(/\r\n|\r|\n/);
    const nonEmptyLines = lines.filter((line) => line.trim() !== '');
    const dedupedLines = Array.from(new Set(nonEmptyLines));
    const sortedLines = [...nonEmptyLines].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
    );
    const collapsedSpaces = value
      .replace(/[\t ]+/g, ' ')
      .replace(/\s+\n/g, '\n')
      .trim();

    return {
      upper: value.toUpperCase(),
      lower: value.toLowerCase(),
      title: toTitleCase(value),
      trimmed,
      collapsedSpaces,
      sortedLines: sortedLines.join('\n'),
      dedupedLines: dedupedLines.join('\n'),
      characters: value.length,
      charactersNoSpaces: value.replace(/\s/g, '').length,
      words: trimmed ? trimmed.split(/\s+/).length : 0,
      lines: value ? lines.length : 0,
    };
  }, [value]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      // Ignore clipboard write failures to keep UI interaction non-blocking.
    }
  };

  const renderOutput = (key: string, label: string, output: string, rows = 2) => (
    <div className="space-y-2" key={key}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">{label}</p>
        <Button
          type="button"
          onClick={() => handleCopy(key, output)}
          className="flex items-center gap-2 px-2 py-1 text-xs"
          disabled={!output}
        >
          {copiedKey === key ? <ClipboardCheck size={14} /> : <Clipboard size={14} />}
          {copiedKey === key ? t('button.copied') : t('button.copy')}
        </Button>
      </div>
      <Textarea
        rows={rows}
        readOnly
        value={output}
        placeholder={t('empty')}
        className="font-mono"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="text-formatter-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('input.label')}
        </label>
        <Textarea
          id="text-formatter-input"
          rows={6}
          placeholder={t('input.placeholder')}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="font-mono"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('input.helper')}</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {t('sections.case.title')}
          </h3>
          {renderOutput('case-upper', t('sections.case.upper'), computed.upper)}
          {renderOutput('case-lower', t('sections.case.lower'), computed.lower)}
          {renderOutput('case-title', t('sections.case.titleCase'), computed.title)}
        </div>

        <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {t('sections.cleanup.title')}
          </h3>
          {renderOutput('cleanup-trim', t('sections.cleanup.trim'), computed.trimmed)}
          {renderOutput(
            'cleanup-collapse',
            t('sections.cleanup.collapse'),
            computed.collapsedSpaces,
          )}
        </div>

        <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {t('sections.lines.title')}
          </h3>
          {renderOutput('lines-sorted', t('sections.lines.sorted'), computed.sortedLines, 3)}
          {renderOutput('lines-deduped', t('sections.lines.deduped'), computed.dedupedLines, 3)}
        </div>

        <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {t('sections.stats.title')}
          </h3>
          <div className="grid gap-3 text-sm text-gray-700 dark:text-gray-200 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl bg-white/60 p-3 text-xs font-medium dark:bg-zinc-900/60">
              <span>{t('sections.stats.characters')}</span>
              <span className="font-mono text-sm">{computed.characters}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/60 p-3 text-xs font-medium dark:bg-zinc-900/60">
              <span>{t('sections.stats.charactersNoSpaces')}</span>
              <span className="font-mono text-sm">{computed.charactersNoSpaces}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/60 p-3 text-xs font-medium dark:bg-zinc-900/60">
              <span>{t('sections.stats.words')}</span>
              <span className="font-mono text-sm">{computed.words}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/60 p-3 text-xs font-medium dark:bg-zinc-900/60">
              <span>{t('sections.stats.lines')}</span>
              <span className="font-mono text-sm">{computed.lines}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
