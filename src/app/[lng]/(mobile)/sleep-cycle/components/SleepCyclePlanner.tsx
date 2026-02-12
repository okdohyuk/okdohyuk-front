'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { H1, Text } from '@components/basic/Text';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@components/basic/Select';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const CYCLE_MINUTES = 90;
const FALL_ASLEEP_MINUTES = 15;
const CYCLE_COUNTS = [6, 5, 4, 3];

type Mode = 'wake' | 'bed';

interface SleepCyclePlannerProps {
  lng: Language;
  title: string;
  description: string;
}

const pad = (value: number) => value.toString().padStart(2, '0');

const formatTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getDayOffset = (base: Date, target: Date) => {
  const baseMidnight = startOfDay(base).getTime();
  const targetMidnight = startOfDay(target).getTime();
  return Math.round((targetMidnight - baseMidnight) / 86400000);
};

const getCurrentTimeValue = () => {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

export default function SleepCyclePlanner({ lng, title, description }: SleepCyclePlannerProps) {
  const { t } = useTranslation(lng, 'sleep-cycle');
  const [mode, setMode] = useState<Mode>('wake');
  const [timeValue, setTimeValue] = useState<string>(getCurrentTimeValue());
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const results = useMemo(() => {
    if (!timeValue) return [];

    const [hours, minutes] = timeValue.split(':').map((value) => Number(value));
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return [];

    const base = new Date();
    base.setHours(hours, minutes, 0, 0);

    return CYCLE_COUNTS.map((cycles) => {
      const totalMinutes = cycles * CYCLE_MINUTES + FALL_ASLEEP_MINUTES;
      const target = new Date(base.getTime() + (mode === 'wake' ? -1 : 1) * totalMinutes * 60000);
      const dayOffset = getDayOffset(base, target);

      return {
        cycles,
        hours: (cycles * CYCLE_MINUTES) / 60,
        time: formatTime(target),
        dayOffset,
      };
    });
  }, [mode, timeValue]);

  const dayOffsetLabel = (offset: number) => {
    if (offset === 0) return '';
    if (offset < 0) return t('dayOffsetPrevious');
    return t('dayOffsetNext');
  };

  const handleCopy = async (text: string, index?: number) => {
    if (!navigator?.clipboard?.writeText) return;
    await navigator.clipboard.writeText(text);
    if (typeof index === 'number') {
      setCopiedIndex(index);
      window.setTimeout(() => setCopiedIndex(null), 1500);
    }
  };

  const handleCopyAll = async () => {
    const text = results
      .map((result) => {
        const offsetLabel = dayOffsetLabel(result.dayOffset);
        return `${t('cyclesLabel', { count: result.cycles })} · ${result.time}${
          offsetLabel ? ` ${offsetLabel}` : ''
        }`;
      })
      .join('\n');

    await handleCopy(text);
  };

  const handleClear = () => {
    setTimeValue('');
  };

  const handleNow = () => {
    setTimeValue(getCurrentTimeValue());
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="space-y-2">
        <H1>{title}</H1>
        <Text variant="t4" className="text-gray-600 dark:text-gray-300">
          {description}
        </Text>
      </header>

      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="grid gap-4 md:grid-cols-[180px_1fr]">
          <div className="space-y-2">
            <Text variant="t4" className="text-gray-700 dark:text-gray-200">
              {t('modeLabel')}
            </Text>
            <Select value={mode} onValueChange={(value) => setMode(value as Mode)}>
              <SelectTrigger aria-label={t('modeLabel')}>
                <SelectValue placeholder={t('modePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wake">{t('modeWake')}</SelectItem>
                <SelectItem value="bed">{t('modeBed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Text variant="t4" className="text-gray-700 dark:text-gray-200">
              {mode === 'wake' ? t('wakeTimeLabel') : t('bedTimeLabel')}
            </Text>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="time"
                value={timeValue}
                onChange={(event) => setTimeValue(event.target.value)}
                className="min-w-[140px]"
              />
              <Button type="button" onClick={handleNow} className="px-3 text-sm">
                {t('now')}
              </Button>
              <Button
                type="button"
                onClick={handleClear}
                className="px-3 text-sm bg-gray-600 hover:bg-gray-500"
              >
                {t('clear')}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Text variant="t5" className="text-gray-600 dark:text-gray-300">
            {t('hint', { cycle: CYCLE_MINUTES, buffer: FALL_ASLEEP_MINUTES })}
          </Text>
        </div>
      </section>

      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Text variant="t3" className="text-gray-800 dark:text-gray-100">
            {t('resultsTitle')}
          </Text>
          <Button type="button" onClick={handleCopyAll} className="px-3 text-sm">
            {t('copyAll')}
          </Button>
        </div>

        {results.length === 0 ? (
          <Text variant="t4" className="text-gray-500">
            {t('empty')}
          </Text>
        ) : (
          <ul className="space-y-3">
            {results.map((result, index) => {
              const offsetLabel = dayOffsetLabel(result.dayOffset);
              return (
                <li
                  key={`${result.cycles}-${result.time}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white/70 p-3 text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-100"
                >
                  <div className="space-y-1">
                    <Text variant="t4" className="font-semibold">
                      {t('cyclesLabel', { count: result.cycles })}
                    </Text>
                    <Text variant="t5" className="text-gray-600 dark:text-gray-300">
                      {t('sleepHours', { hours: result.hours })}
                    </Text>
                  </div>
                  <div className="flex items-center gap-3">
                    <Text variant="t3" className="font-semibold">
                      {result.time}
                    </Text>
                    {offsetLabel && (
                      <Text variant="t5" className="text-gray-500">
                        {offsetLabel}
                      </Text>
                    )}
                    <Button
                      type="button"
                      onClick={() =>
                        handleCopy(`${result.time}${offsetLabel ? ` ${offsetLabel}` : ''}`, index)
                      }
                      className="px-3 text-sm"
                    >
                      {copiedIndex === index ? t('copied') : t('copy')}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
