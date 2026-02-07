'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, RotateCcw, Shuffle } from 'lucide-react';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { buildUnifiedDiff, createLineDiff, getLineStats } from '../utils/diffUtils';

const MAX_DIFF_CELLS = 12000;

const sampleLeft = `Line one
Line two
Line three
Line five`;

const sampleRight = `Line one
Line two updated
Line three
Line four
Line five`;

interface DiffViewerClientProps {
  lng: Language;
}

export default function DiffViewerClient({ lng }: DiffViewerClientProps) {
  const { t } = useTranslation(lng, 'diff-viewer');
  const [leftValue, setLeftValue] = useState('');
  const [rightValue, setRightValue] = useState('');
  const [copied, setCopied] = useState(false);

  const lineStats = useMemo(
    () => ({
      left: getLineStats(leftValue),
      right: getLineStats(rightValue),
    }),
    [leftValue, rightValue],
  );

  const diffResult = useMemo(() => {
    const leftLines = leftValue.replace(/\r\n/g, '\n').split('\n').length;
    const rightLines = rightValue.replace(/\r\n/g, '\n').split('\n').length;
    const cellCount = leftLines * rightLines;

    if (cellCount > MAX_DIFF_CELLS) {
      return { limited: true, lines: [], summary: { added: 0, removed: 0, unchanged: 0 } };
    }

    return { ...createLineDiff(leftValue, rightValue), limited: false };
  }, [leftValue, rightValue]);

  const diffText = useMemo(
    () => (diffResult.lines.length ? buildUnifiedDiff(diffResult.lines) : ''),
    [diffResult.lines],
  );

  const getLineStyle = (type: 'add' | 'remove' | 'equal') => {
    if (type === 'add') return 'text-emerald-600 dark:text-emerald-300';
    if (type === 'remove') return 'text-rose-600 dark:text-rose-300';
    return 'text-gray-600 dark:text-gray-300';
  };

  const getLinePrefix = (type: 'add' | 'remove' | 'equal') => {
    if (type === 'add') return '+';
    if (type === 'remove') return '-';
    return ' ';
  };

  const handleCopy = async () => {
    if (!diffText) return;
    try {
      await navigator.clipboard.writeText(diffText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy diff:', error);
    }
  };

  const handleClear = () => {
    setLeftValue('');
    setRightValue('');
    setCopied(false);
  };

  const handleSwap = () => {
    setLeftValue(rightValue);
    setRightValue(leftValue);
    setCopied(false);
  };

  const handleExample = () => {
    setLeftValue(sampleLeft);
    setRightValue(sampleRight);
    setCopied(false);
  };

  const isEmpty = !leftValue.trim() && !rightValue.trim();

  return (
    <div className="space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Text variant="b2" className="text-gray-700 dark:text-gray-300">
            {t('helper')}
          </Text>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" className="gap-2" onClick={handleExample}>
              <Shuffle size={16} />
              {t('button.example')}
            </Button>
            <Button type="button" variant="secondary" className="gap-2" onClick={handleSwap}>
              <RotateCcw size={16} />
              {t('button.swap')}
            </Button>
            <Button type="button" variant="secondary" className="gap-2" onClick={handleClear}>
              {t('button.clear')}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="diff-left"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.left')}
            </label>
            <Textarea
              id="diff-left"
              className="min-h-[220px] font-mono text-sm"
              value={leftValue}
              placeholder={t('placeholder.left')}
              onChange={(event) => setLeftValue(event.target.value)}
            />
            <Text variant="c1" className="text-gray-500 dark:text-gray-400">
              {t('stats', { total: lineStats.left.total, nonEmpty: lineStats.left.nonEmpty })}
            </Text>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="diff-right"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.right')}
            </label>
            <Textarea
              id="diff-right"
              className="min-h-[220px] font-mono text-sm"
              value={rightValue}
              placeholder={t('placeholder.right')}
              onChange={(event) => setRightValue(event.target.value)}
            />
            <Text variant="c1" className="text-gray-500 dark:text-gray-400">
              {t('stats', { total: lineStats.right.total, nonEmpty: lineStats.right.nonEmpty })}
            </Text>
          </div>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Text variant="b2" className="text-gray-700 dark:text-gray-300">
            {t('label.result')}
          </Text>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!diffText}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>

        {diffResult.limited ? (
          <Text variant="b3" className="text-amber-600 dark:text-amber-400">
            {t('warning.largeInput')}
          </Text>
        ) : null}

        {isEmpty ? (
          <Text variant="b3" className="text-gray-500 dark:text-gray-400">
            {t('empty')}
          </Text>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                {t('summary.added', { count: diffResult.summary.added })}
              </span>
              <span className="rounded-full bg-rose-100 px-2 py-1 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                {t('summary.removed', { count: diffResult.summary.removed })}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                {t('summary.unchanged', { count: diffResult.summary.unchanged })}
              </span>
            </div>

            <div className="max-h-[360px] overflow-auto rounded-2xl border border-zinc-200/70 bg-white/70 p-3 font-mono text-xs shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/70">
              {diffResult.lines.map((line) => {
                const style = getLineStyle(line.type);
                const prefix = getLinePrefix(line.type);
                const key = `${line.type}-${line.leftLine ?? 'x'}-${line.rightLine ?? 'y'}`;
                return (
                  <div key={key} className={cn('flex gap-3', style)}>
                    <span className="w-10 text-right text-[10px] text-gray-400">
                      {line.leftLine ?? ''}
                    </span>
                    <span className="w-10 text-right text-[10px] text-gray-400">
                      {line.rightLine ?? ''}
                    </span>
                    <span className="whitespace-pre-wrap break-all">
                      {prefix}
                      {line.content || ' '}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
