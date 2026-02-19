'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { H1 } from '@components/basic/Text/Headers';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface BpmTapperClientProps {
  lng: Language;
}

const formatInterval = (intervalMs: number | null) => {
  if (!intervalMs) return '-';
  if (intervalMs < 1000) return `${Math.round(intervalMs)} ms`;
  return `${(intervalMs / 1000).toFixed(2)} s`;
};

export default function BpmTapperClient({ lng }: BpmTapperClientProps) {
  const { t } = useTranslation(lng, 'bpm-tapper');
  const [taps, setTaps] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  const { bpm, averageInterval } = useMemo(() => {
    if (taps.length < 2) {
      return { bpm: null, averageInterval: null };
    }

    const intervals = taps
      .slice(1)
      .map((time, index) => time - taps[index])
      .filter(Boolean);
    const total = intervals.reduce((sum, value) => sum + value, 0);
    const average = total / intervals.length;
    const computedBpm = average > 0 ? Math.round(60000 / average) : null;

    return { bpm: computedBpm, averageInterval: average };
  }, [taps]);

  const handleTap = () => {
    const now = Date.now();
    setTaps((prev) => [...prev, now]);
  };

  const handleReset = () => {
    setTaps([]);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!bpm) return;
    try {
      await navigator.clipboard.writeText(String(bpm));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className={cn(SERVICE_PANEL, 'p-6 text-center space-y-3')}>
        <Text variant="d2" color="basic-4">
          {t('hint')}
        </Text>
        <div className="flex items-baseline justify-center gap-2">
          <H1>{bpm ?? '--'}</H1>
          <Text variant="d2" color="basic-3">
            BPM
          </Text>
        </div>
        <Text variant="d3" color="basic-5">
          {t('helper')}
        </Text>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'p-6 space-y-4')}>
        <Button onClick={handleTap} className="w-full py-4 text-xl">
          {t('tapButton')}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-4 text-center dark:border-zinc-700/70 dark:bg-zinc-900/70">
            <Text variant="d3" color="basic-4">
              {t('taps')}
            </Text>
            <Text variant="t2" color="basic-1">
              {taps.length}
            </Text>
          </div>
          <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-4 text-center dark:border-zinc-700/70 dark:bg-zinc-900/70">
            <Text variant="d3" color="basic-4">
              {t('averageInterval')}
            </Text>
            <Text variant="t2" color="basic-1">
              {formatInterval(averageInterval)}
            </Text>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={handleReset}
            className="flex-1 bg-zinc-200 text-zinc-900 hover:bg-zinc-300"
          >
            {t('resetButton')}
          </Button>
          <Button onClick={handleCopy} disabled={!bpm} className="flex-1">
            {copied ? t('copied') : t('copyButton')}
          </Button>
        </div>
      </section>
    </div>
  );
}
