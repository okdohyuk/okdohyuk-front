'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { Textarea } from '@components/basic/Textarea';
import { Copy, RefreshCcw, Wand2 } from 'lucide-react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

type TextToolkitClientProps = {
  lng: Language;
};

const normalize = (value: string) => value.replace(/\r\n/g, '\n');
const splitLines = (value: string) => normalize(value).split('\n');

const toTitleCase = (value: string) =>
  value.toLowerCase().replace(/\b(\p{L}|\p{N})/gu, (match) => match.toUpperCase());

const trimLines = (value: string) =>
  splitLines(value)
    .map((line) => line.trim())
    .join('\n');

const collapseSpaces = (value: string) =>
  normalize(value)
    .replace(/[^\S\r\n]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();

const removeEmptyLines = (value: string) =>
  splitLines(value)
    .filter((line) => line.trim())
    .join('\n');

const dedupeLines = (value: string) => {
  const seen = new Set<string>();
  const lines = splitLines(value);
  const result = lines.filter((line) => {
    const key = line.trim();
    if (!key) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return result.join('\n');
};

const sortLines = (value: string) =>
  splitLines(value)
    .filter((line) => line.trim())
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    .join('\n');

export default function TextToolkitClient({ lng }: TextToolkitClientProps) {
  const { t } = useTranslation(lng, 'text-toolkit');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const baseText = output || input;

  const stats = useMemo(() => {
    const normalized = normalize(output || input);
    const trimmed = normalized.trim();

    return {
      characters: normalized.length,
      words: trimmed ? trimmed.split(/\s+/).length : 0,
      lines: normalized ? normalized.split('\n').length : 0,
    };
  }, [input, output]);

  const actions = useMemo(
    () => [
      {
        group: 'case',
        label: t('groups.case'),
        items: [
          { key: 'upper', label: t('actions.upper'), run: (value: string) => value.toUpperCase() },
          { key: 'lower', label: t('actions.lower'), run: (value: string) => value.toLowerCase() },
          { key: 'title', label: t('actions.title'), run: toTitleCase },
        ],
      },
      {
        group: 'whitespace',
        label: t('groups.whitespace'),
        items: [
          { key: 'trim', label: t('actions.trim'), run: (value: string) => value.trim() },
          { key: 'trimLines', label: t('actions.trimLines'), run: trimLines },
          { key: 'collapseSpaces', label: t('actions.collapseSpaces'), run: collapseSpaces },
        ],
      },
      {
        group: 'lines',
        label: t('groups.lines'),
        items: [
          { key: 'removeEmptyLines', label: t('actions.removeEmptyLines'), run: removeEmptyLines },
          { key: 'dedupeLines', label: t('actions.dedupeLines'), run: dedupeLines },
          { key: 'sortLines', label: t('actions.sortLines'), run: sortLines },
        ],
      },
    ],
    [t],
  );

  const applyAction = (run: (value: string) => string) => {
    setOutput(run(baseText));
  };

  const resetOutput = () => {
    setOutput(input);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
  };

  const useOutputAsInput = () => {
    if (!output) return;
    setInput(output);
  };

  const copyOutput = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <div className="space-y-4">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-4')}>
        <Text variant="d3" className="font-medium text-zinc-700 dark:text-zinc-200">
          {t('label.input')}
        </Text>
        <Textarea
          id="text-toolkit-input"
          className="min-h-[160px] text-sm"
          placeholder={t('placeholder')}
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <Text variant="c1" className="text-zinc-500 dark:text-zinc-400">
          {t('helper')}
        </Text>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
          <div className="flex items-center justify-between gap-2">
            <Text variant="d3" className="font-medium text-zinc-700 dark:text-zinc-200">
              {t('label.output')}
            </Text>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                className="gap-2 px-3 py-1 text-sm"
                onClick={resetOutput}
                disabled={!input}
              >
                <RefreshCcw size={14} />
                {t('actions.resetOutput')}
              </Button>
              <Button
                type="button"
                className="gap-2 px-3 py-1 text-sm"
                onClick={copyOutput}
                disabled={!output}
              >
                <Copy size={14} />
                {copied ? t('actions.copied') : t('actions.copyOutput')}
              </Button>
            </div>
          </div>
          <Textarea
            id="text-toolkit-output"
            className="min-h-[180px] text-sm"
            placeholder={t('empty')}
            value={output}
            onChange={(event) => setOutput(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="gap-2 px-3 py-1 text-sm" onClick={useOutputAsInput}>
              <Wand2 size={14} />
              {t('actions.useOutputAsInput')}
            </Button>
            <Button type="button" className="gap-2 px-3 py-1 text-sm" onClick={clearAll}>
              {t('actions.clearAll')}
            </Button>
          </div>
        </div>

        <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
          <Text variant="d3" className="font-medium text-zinc-700 dark:text-zinc-200">
            {t('label.stats')}
          </Text>
          <div className="grid gap-3">
            {[
              { key: 'characters', label: t('stats.characters'), value: stats.characters },
              { key: 'words', label: t('stats.words'), value: stats.words },
              { key: 'lines', label: t('stats.lines'), value: stats.lines },
            ].map((item) => (
              <div
                key={item.key}
                className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-1 p-3')}
              >
                <Text
                  variant="c1"
                  className="uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                >
                  {item.label}
                </Text>
                <Text variant="t3" className="font-bold text-zinc-900 dark:text-white">
                  {item.value.toLocaleString()}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {actions.map((group) => (
          <div key={group.group} className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
            <Text variant="d3" className="font-medium text-zinc-700 dark:text-zinc-200">
              {group.label}
            </Text>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <Button
                  key={item.key}
                  type="button"
                  className="px-3 py-1 text-sm"
                  onClick={() => applyAction(item.run)}
                  disabled={!baseText}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
