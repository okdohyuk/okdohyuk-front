'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface StopwatchClientProps {
  lng: Language;
}

interface LapEntry {
  id: string;
  totalMs: number;
  lapMs: number;
}

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);

  const pad = (value: number, length = 2) => value.toString().padStart(length, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`;
};

export default function StopwatchClient({ lng }: StopwatchClientProps) {
  const { t } = useTranslation(lng, 'stopwatch');
  const [isRunning, setIsRunning] = useState(false);
  const [startAt, setStartAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [baseElapsed, setBaseElapsed] = useState(0);
  const [laps, setLaps] = useState<LapEntry[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isRunning || startAt === null) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setElapsedMs(Date.now() - startAt + baseElapsed);
    }, 50);

    return () => window.clearInterval(timer);
  }, [isRunning, startAt, baseElapsed]);

  useEffect(() => {
    setCopied(false);
  }, [elapsedMs, laps]);

  const formattedTime = useMemo(() => formatTime(elapsedMs), [elapsedMs]);
  const primaryLabel = useMemo(() => {
    if (isRunning) return t('button.pause');
    if (elapsedMs > 0) return t('button.resume');
    return t('button.start');
  }, [elapsedMs, isRunning, t]);

  const handleStart = () => {
    if (isRunning) return;
    setStartAt(Date.now());
    setIsRunning(true);
  };

  const handlePause = () => {
    if (!isRunning) return;
    setBaseElapsed(elapsedMs);
    setIsRunning(false);
    setStartAt(null);
  };

  const handleReset = () => {
    setIsRunning(false);
    setStartAt(null);
    setElapsedMs(0);
    setBaseElapsed(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (!isRunning) return;

    setLaps((prev) => {
      const lastTotal = prev.length ? prev[prev.length - 1].totalMs : 0;
      const lapMs = elapsedMs - lastTotal;
      return [
        ...prev,
        {
          id: `${Date.now()}-${prev.length}`,
          totalMs: elapsedMs,
          lapMs,
        },
      ];
    });
  };

  const handleCopy = async () => {
    const lapText = laps
      .map((lap, index) => {
        const number = index + 1;
        return `${t('label.lap')} ${number}: ${formatTime(lap.lapMs)} (${formatTime(lap.totalMs)})`;
      })
      .join('\n');
    const text = lapText
      ? `${t('label.currentTime')}: ${formattedTime}\n${lapText}`
      : `${t('label.currentTime')}: ${formattedTime}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy stopwatch text', error);
    }
  };

  const isResetDisabled = elapsedMs === 0 && laps.length === 0;
  const isLapDisabled = !isRunning;

  const lapsForDisplay = useMemo(() => [...laps].reverse(), [laps]);

  return (
    <div className="space-y-4">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-5 text-center')}>
        <Text asChild variant="d3" color="basic-5">
          <p>{t('label.currentTime')}</p>
        </Text>
        <Text asChild variant="t1" className="tabular-nums">
          <p>{formattedTime}</p>
        </Text>
        <Text asChild variant="c1" color="basic-5">
          <p>{t('helper')}</p>
        </Text>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" onClick={isRunning ? handlePause : handleStart}>
            {primaryLabel}
          </Button>
          <Button type="button" onClick={handleLap} disabled={isLapDisabled}>
            {t('button.lap')}
          </Button>
          <Button
            type="button"
            onClick={handleReset}
            disabled={isResetDisabled}
            className="border border-zinc-200/70 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700/70 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t('button.reset')}
          </Button>
          <Button
            type="button"
            onClick={handleCopy}
            className="border border-zinc-200/70 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700/70 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {copied ? (
              <span className="flex items-center gap-2">
                <ClipboardCheck size={16} />
                {t('button.copied')}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Clipboard size={16} />
                {t('button.copy')}
              </span>
            )}
          </Button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex items-center justify-between">
          <Text asChild variant="d3" color="basic-4">
            <p>{t('label.laps')}</p>
          </Text>
          <Text asChild variant="c1" color="basic-6">
            <p>{t('label.total', { count: laps.length })}</p>
          </Text>
        </div>
        {lapsForDisplay.length === 0 ? (
          <Text asChild variant="d3" color="basic-5">
            <p>{t('empty')}</p>
          </Text>
        ) : (
          <ol className="space-y-2">
            {lapsForDisplay.map((lap, index) => {
              const lapNumber = laps.length - index;
              return (
                <li
                  key={lap.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200/60 bg-white/70 px-3 py-2 text-sm dark:border-zinc-700/60 dark:bg-zinc-900/60"
                >
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {t('label.lap')} {lapNumber}
                  </span>
                  <span className="flex-1 text-right text-sm font-semibold tabular-nums">
                    {formatTime(lap.lapMs)}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                    {formatTime(lap.totalMs)}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
