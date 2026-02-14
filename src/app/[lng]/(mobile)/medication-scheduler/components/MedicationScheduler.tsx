'use client';

import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { Text } from '@components/basic/Text';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from 'react-i18next';
import { cn } from '@utils/cn';

const MAX_DOSES = 20;
const MAX_INTERVAL_HOURS = 240;

const localeMap: Record<Language, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

const formatInputDateTime = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");

const formatDisplayDate = (date: Date, lng: Language) =>
  new Intl.DateTimeFormat(localeMap[lng], {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);

const buildIntervalLabel = (
  hours: number,
  minutes: number,
  t: (key: string, options?: any) => string,
) => {
  const parts: string[] = [];
  if (hours > 0) {
    parts.push(t('intervalHoursText', { count: hours }));
  }
  if (minutes > 0) {
    parts.push(t('intervalMinutesText', { count: minutes }));
  }
  if (parts.length === 0) {
    return t('intervalMinutesText', { count: 0 });
  }
  return parts.join(' ');
};

export default function MedicationScheduler({ lng }: { lng: Language }) {
  const { t } = useTranslation('medication-scheduler');
  const [startTime, setStartTime] = useState('');
  const [intervalHours, setIntervalHours] = useState('4');
  const [intervalMinutes, setIntervalMinutes] = useState('0');
  const [doseCount, setDoseCount] = useState('6');
  const [copied, setCopied] = useState(false);

  const { schedule, error, intervalLabel } = useMemo(() => {
    const startDate = startTime ? new Date(startTime) : null;
    const hours = Number(intervalHours);
    const minutes = Number(intervalMinutes);
    const count = Number(doseCount);
    const totalMinutes = hours * 60 + minutes;

    if (!startDate || Number.isNaN(startDate.getTime())) {
      return { schedule: [], error: t('errors.startTime'), intervalLabel: '' };
    }

    if (totalMinutes <= 0) {
      return { schedule: [], error: t('errors.interval'), intervalLabel: '' };
    }

    if (Number.isNaN(count) || count < 1 || count > MAX_DOSES) {
      return { schedule: [], error: t('errors.doseCount', { max: MAX_DOSES }), intervalLabel: '' };
    }

    const results = Array.from({ length: count }).map((_, index) => {
      const date = new Date(startDate);
      date.setMinutes(date.getMinutes() + totalMinutes * index);
      return date;
    });

    return {
      schedule: results,
      error: '',
      intervalLabel: buildIntervalLabel(hours, minutes, t),
    };
  }, [doseCount, intervalHours, intervalMinutes, startTime, t]);

  const handleSetNow = () => {
    const now = new Date();
    setStartTime(formatInputDateTime(now));
  };

  const handleReset = () => {
    setStartTime('');
    setIntervalHours('4');
    setIntervalMinutes('0');
    setDoseCount('6');
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!schedule.length) return;
    const content = schedule
      .map((date, index) => `${index + 1}. ${formatDisplayDate(date, lng)}`)
      .join('\n');
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const intervalSummary = intervalLabel || t('intervalFallback');

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Text variant="d2" color="basic-4">
          {t('description')}
        </Text>
        <Text variant="c1" color="basic-5">
          {t('disclaimer')}
        </Text>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-4">
        <div className="space-y-2">
          <Text variant="d2" className="font-semibold">
            {t('labels.startTime')}
          </Text>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              type="datetime-local"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
            <Button className="sm:w-[140px]" type="button" onClick={handleSetNow}>
              {t('buttons.setNow')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Text variant="d2" className="font-semibold">
              {t('labels.intervalHours')}
            </Text>
            <Input
              type="number"
              min={0}
              max={MAX_INTERVAL_HOURS}
              value={intervalHours}
              onChange={(event) => setIntervalHours(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text variant="d2" className="font-semibold">
              {t('labels.intervalMinutes')}
            </Text>
            <Input
              type="number"
              min={0}
              max={59}
              value={intervalMinutes}
              onChange={(event) => setIntervalMinutes(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Text variant="d2" className="font-semibold">
            {t('labels.doseCount')}
          </Text>
          <Input
            type="number"
            min={1}
            max={MAX_DOSES}
            value={doseCount}
            onChange={(event) => setDoseCount(event.target.value)}
          />
          <Text variant="c1" color="basic-5">
            {t('doseHint', { max: MAX_DOSES })}
          </Text>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            className="min-w-[120px]"
            type="button"
            onClick={handleCopy}
            disabled={!schedule.length}
          >
            {copied ? t('buttons.copied') : t('buttons.copy')}
          </Button>
          <Button
            className="min-w-[120px] bg-gray-200 text-gray-800 hover:bg-gray-300"
            type="button"
            onClick={handleReset}
          >
            {t('buttons.reset')}
          </Button>
        </div>

        {error ? (
          <Text variant="d3" color="basic-5">
            {error}
          </Text>
        ) : (
          <Text variant="d3" color="basic-4">
            {t('summary', { count: schedule.length, interval: intervalSummary })}
          </Text>
        )}
      </div>

      <div className="space-y-3">
        <Text variant="d2" className="font-semibold">
          {t('scheduleTitle')}
        </Text>
        <div className={cn('space-y-2', !schedule.length && 'opacity-60')}>
          {schedule.length ? (
            schedule.map((date, index) => (
              <div
                key={date.getTime()}
                className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
              >
                <Text variant="d2">{index + 1}회</Text>
                <Text variant="d2" color="basic-3">
                  {formatDisplayDate(date, lng)}
                </Text>
              </div>
            ))
          ) : (
            <Text variant="d3" color="basic-5">
              {t('empty')}
            </Text>
          )}
        </div>
      </div>
    </section>
  );
}
