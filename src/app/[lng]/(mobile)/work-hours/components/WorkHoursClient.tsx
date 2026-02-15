'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { H1, Text } from '@components/basic/Text';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface WorkHoursClientProps {
  lng: Language;
  title: string;
  description: string;
}

const MINUTES_IN_DAY = 24 * 60;

const parseTime = (value: string) => {
  if (!value) return null;
  const [hour, minute] = value.split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return hour * 60 + minute;
};

export default function WorkHoursClient({ lng, title, description }: WorkHoursClientProps) {
  const { t } = useTranslation(lng, 'work-hours');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [breakMinutes, setBreakMinutes] = useState('60');
  const [isOvernight, setIsOvernight] = useState(false);
  const [copied, setCopied] = useState(false);

  const calculation = useMemo(() => {
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    const breakValue = Math.max(0, Number(breakMinutes) || 0);

    if (start === null || end === null) {
      return { minutes: null, error: null, breakValue };
    }

    let total = end - start;
    if (isOvernight) {
      total += MINUTES_IN_DAY;
    }

    if (total < 0) {
      return { minutes: null, error: 'endBeforeStart', breakValue };
    }

    const workMinutes = total - breakValue;

    if (workMinutes < 0) {
      return { minutes: null, error: 'breakTooLong', breakValue };
    }

    return { minutes: workMinutes, total, error: null, breakValue };
  }, [startTime, endTime, breakMinutes, isOvernight]);

  const handleCopy = async () => {
    if (calculation.minutes === null) return;
    const hours = Math.floor(calculation.minutes / 60);
    const minutes = calculation.minutes % 60;
    const decimalHours = (calculation.minutes / 60).toFixed(2);
    const summary = `${t('summary.workTime')}: ${hours}${t('unit.hour')} ${minutes}${t(
      'unit.minute',
    )} (${t('summary.decimal')}: ${decimalHours}${t('unit.hour')})`;

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy result', error);
    }
  };

  const handleReset = () => {
    setStartTime('');
    setEndTime('');
    setBreakMinutes('60');
    setIsOvernight(false);
  };

  const examples = t('examples.items', { returnObjects: true }) as string[];

  const resultContent = useMemo(() => {
    if (calculation.error) {
      return <Text className="text-sm text-rose-500">{t(`result.${calculation.error}`)}</Text>;
    }

    if (calculation.minutes === null) {
      return <Text className="text-sm text-zinc-500 dark:text-zinc-400">{t('result.empty')}</Text>;
    }

    return (
      <div className="space-y-2">
        <Text className="text-2xl font-bold text-point-1">
          {t('summary.workTime')} · {Math.floor(calculation.minutes / 60)}
          {t('unit.hour')} {calculation.minutes % 60}
          {t('unit.minute')}
        </Text>
        <div className="grid gap-2 text-sm text-zinc-600 dark:text-zinc-300 md:grid-cols-3">
          <Text>
            {t('summary.totalTime')}: {Math.floor((calculation.total ?? 0) / 60)}
            {t('unit.hour')} {Math.floor((calculation.total ?? 0) % 60)}
            {t('unit.minute')}
          </Text>
          <Text>
            {t('summary.breakTime')}: {calculation.breakValue}
            {t('unit.minute')}
          </Text>
          <Text>
            {t('summary.decimal')}: {(calculation.minutes / 60).toFixed(2)}
            {t('unit.hour')}
          </Text>
        </div>
      </div>
    );
  }, [calculation, t]);

  return (
    <div className="space-y-6">
      <header className={cn(SERVICE_PANEL, 'space-y-2 px-5 py-6 md:px-7 md:py-7')}>
        <H1 className="text-3xl md:text-4xl font-black tracking-tight">{title}</H1>
        <Text className="text-sm text-zinc-600 dark:text-zinc-300">{description}</Text>
      </header>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-5 p-4')}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="work-start-time"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-200"
            >
              {t('labels.startTime')}
            </label>
            <Input
              id="work-start-time"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="work-end-time"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-200"
            >
              {t('labels.endTime')}
            </label>
            <Input
              id="work-end-time"
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="work-break-minutes"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-200"
          >
            {t('labels.breakMinutes')}
          </label>
          <Input
            id="work-break-minutes"
            type="number"
            min={0}
            value={breakMinutes}
            placeholder={t('placeholder.breakMinutes')}
            onChange={(event) => setBreakMinutes(event.target.value)}
          />
          <Text className="text-xs text-zinc-500 dark:text-zinc-400">
            {t('helper.breakMinutes')}
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="overnight"
            type="checkbox"
            checked={isOvernight}
            onChange={() => setIsOvernight(!isOvernight)}
            className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
          />
          <label
            htmlFor="overnight"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-200"
          >
            {t('labels.overnight')}
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleCopy}
            disabled={calculation.minutes === null}
            className="px-4 py-2 text-sm"
          >
            {copied ? t('toast.copied') : t('button.copy')}
          </Button>
          <Button
            onClick={handleReset}
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
          >
            {t('button.reset')}
          </Button>
        </div>
      </section>

      <section
        className={cn(
          SERVICE_PANEL_SOFT,
          SERVICE_CARD_INTERACTIVE,
          'space-y-4 p-5 text-center md:text-left',
        )}
      >
        <Text className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {t('result.title')}
        </Text>
        {resultContent}
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-4')}>
        <Text className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {t('examples.title')}
        </Text>
        <ul className="space-y-1 text-sm text-zinc-500 dark:text-zinc-400">
          {examples.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
