'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@components/basic/Input/Input';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select/Select';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';
import { cn } from '@utils/cn';

const MS_IN_DAY = 24 * 60 * 60 * 1000;

const pad = (value: number) => String(value).padStart(2, '0');

const formatDateInput = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const formatTimeInput = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max);

const toStartOfDay = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

type WeekStart = 'monday' | 'sunday';

type YearProgressClientProps = {
  lng: Language;
};

export default function YearProgressClient({ lng }: YearProgressClientProps) {
  const { t } = useTranslation(lng, 'year-progress');
  const now = useMemo(() => new Date(), []);

  const [dateValue, setDateValue] = useState(() => formatDateInput(now));
  const [timeValue, setTimeValue] = useState(() => formatTimeInput(now));
  const [weekStart, setWeekStart] = useState<WeekStart>('monday');
  const [copied, setCopied] = useState(false);

  const selectedDate = useMemo(() => {
    const composed = new Date(`${dateValue}T${timeValue}`);
    if (Number.isNaN(composed.getTime())) {
      return now;
    }
    return composed;
  }, [dateValue, timeValue, now]);

  const metrics = useMemo(() => {
    const startOfDay = toStartOfDay(selectedDate);
    const yearStart = new Date(startOfDay.getFullYear(), 0, 1);
    const yearEnd = new Date(startOfDay.getFullYear() + 1, 0, 1);
    const totalYearDays = Math.round((yearEnd.getTime() - yearStart.getTime()) / MS_IN_DAY);
    const dayOfYear = Math.floor((startOfDay.getTime() - yearStart.getTime()) / MS_IN_DAY) + 1;

    const monthStart = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), 1);
    const monthEnd = new Date(startOfDay.getFullYear(), startOfDay.getMonth() + 1, 1);
    const totalMonthDays = Math.round((monthEnd.getTime() - monthStart.getTime()) / MS_IN_DAY);
    const dayOfMonth = startOfDay.getDate();

    const weekStartIndex = weekStart === 'monday' ? 1 : 0;
    const dayOfWeek = startOfDay.getDay();
    const diff = (dayOfWeek - weekStartIndex + 7) % 7;
    const weekStartDate = new Date(startOfDay);
    weekStartDate.setDate(weekStartDate.getDate() - diff);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 7);
    const dayOfWeekNumber = diff + 1;

    const msSinceDayStart = selectedDate.getTime() - startOfDay.getTime();
    const dayProgress = clamp((msSinceDayStart / MS_IN_DAY) * 100);
    const dayHoursPassed = msSinceDayStart / (60 * 60 * 1000);

    return {
      year: {
        total: totalYearDays,
        current: dayOfYear,
        remaining: totalYearDays - dayOfYear,
        progress: clamp((dayOfYear / totalYearDays) * 100),
      },
      month: {
        total: totalMonthDays,
        current: dayOfMonth,
        remaining: totalMonthDays - dayOfMonth,
        progress: clamp((dayOfMonth / totalMonthDays) * 100),
      },
      week: {
        total: 7,
        current: dayOfWeekNumber,
        remaining: 7 - dayOfWeekNumber,
        progress: clamp((dayOfWeekNumber / 7) * 100),
        range: { start: weekStartDate, end: weekEndDate },
      },
      day: {
        total: 24,
        current: dayHoursPassed,
        remaining: 24 - dayHoursPassed,
        progress: dayProgress,
      },
    };
  }, [selectedDate, weekStart]);

  const percentFormatter = useMemo(
    () => new Intl.NumberFormat(lng, { maximumFractionDigits: 1 }),
    [lng],
  );

  const numberFormatter = useMemo(() => new Intl.NumberFormat(lng), [lng]);

  const handleReset = () => {
    const current = new Date();
    setDateValue(formatDateInput(current));
    setTimeValue(formatTimeInput(current));
  };

  const summaryLines = [
    `${t('summary.title')} ${dateValue} ${timeValue}`,
    `${t('cards.year.title')}: ${percentFormatter.format(metrics.year.progress)}% (${t(
      'summary.dayProgress',
      { current: metrics.year.current, total: metrics.year.total },
    )})`,
    `${t('cards.month.title')}: ${percentFormatter.format(metrics.month.progress)}% (${t(
      'summary.dayProgress',
      { current: metrics.month.current, total: metrics.month.total },
    )})`,
    `${t('cards.week.title')}: ${percentFormatter.format(metrics.week.progress)}% (${t(
      'summary.dayProgress',
      { current: metrics.week.current, total: metrics.week.total },
    )})`,
    `${t('cards.day.title')}: ${percentFormatter.format(metrics.day.progress)}% (${t(
      'summary.hourProgress',
      { current: metrics.day.current.toFixed(1), total: metrics.day.total },
    )})`,
  ];

  const summaryText = summaryLines.join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      setCopied(false);
    }
  };

  const progressCards = [
    {
      key: 'year',
      title: t('cards.year.title'),
      progress: metrics.year.progress,
      current: metrics.year.current,
      total: metrics.year.total,
      remaining: metrics.year.remaining,
    },
    {
      key: 'month',
      title: t('cards.month.title'),
      progress: metrics.month.progress,
      current: metrics.month.current,
      total: metrics.month.total,
      remaining: metrics.month.remaining,
    },
    {
      key: 'week',
      title: t('cards.week.title'),
      progress: metrics.week.progress,
      current: metrics.week.current,
      total: metrics.week.total,
      remaining: metrics.week.remaining,
      rangeLabel: `${formatDateInput(metrics.week.range.start)} ~ ${formatDateInput(
        new Date(metrics.week.range.end.getTime() - MS_IN_DAY),
      )}`,
    },
    {
      key: 'day',
      title: t('cards.day.title'),
      progress: metrics.day.progress,
      current: metrics.day.current,
      total: metrics.day.total,
      remaining: metrics.day.remaining,
      unit: t('cards.day.hourUnit'),
      isHour: true,
    },
  ] as const;

  return (
    <div className="space-y-4">
      <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Text variant="d2" color="basic-4" className="block">
              {t('labels.date')}
            </Text>
            <Input
              type="date"
              value={dateValue}
              onChange={(event) => setDateValue(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text variant="d2" color="basic-4" className="block">
              {t('labels.time')}
            </Text>
            <Input
              type="time"
              value={timeValue}
              onChange={(event) => setTimeValue(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text variant="d2" color="basic-4" className="block">
              {t('labels.weekStart')}
            </Text>
            <Select value={weekStart} onValueChange={(value) => setWeekStart(value as WeekStart)}>
              <SelectTrigger aria-label={t('labels.weekStart')}>
                <SelectValue placeholder={t('labels.weekStart')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">{t('weekStartOptions.monday')}</SelectItem>
                <SelectItem value="sunday">{t('weekStartOptions.sunday')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col justify-end gap-2 sm:flex-row sm:items-end">
            <Button className="w-full sm:w-auto" onClick={handleReset} variant="secondary">
              {t('actions.resetNow')}
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleCopy}>
              {copied ? t('actions.copied') : t('actions.copySummary')}
            </Button>
          </div>
        </div>
        <Text variant="c1" color="basic-5" className="block">
          {t('hint')}
        </Text>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {progressCards.map((item) => (
          <div
            key={item.key}
            className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="space-y-1">
              <Text variant="d1" className="block font-semibold">
                {item.title}
              </Text>
              {item.rangeLabel && (
                <Text variant="c1" color="basic-5" className="block">
                  {item.rangeLabel}
                </Text>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <Text variant="t3" className="font-bold">
                  {percentFormatter.format(item.progress)}%
                </Text>
                <Text variant="d2" color="basic-4">
                  {t('cards.progressLabel')}
                </Text>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className={cn(
                    'h-2 rounded-full bg-point-1 transition-all',
                    item.progress > 0 ? 'min-w-[8px]' : 'w-0',
                  )}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
            <div className="grid gap-1">
              <Text variant="d2" color="basic-4" className="flex items-center justify-between">
                <span>{t('cards.passed')}</span>
                <span>
                  {item.isHour
                    ? `${numberFormatter.format(Number(item.current.toFixed(1)))} ${item.unit}`
                    : `${numberFormatter.format(item.current)} ${t('cards.dayUnit')}`}
                </span>
              </Text>
              <Text variant="d2" color="basic-4" className="flex items-center justify-between">
                <span>{t('cards.remaining')}</span>
                <span>
                  {item.isHour
                    ? `${numberFormatter.format(Number(item.remaining.toFixed(1)))} ${item.unit}`
                    : `${numberFormatter.format(item.remaining)} ${t('cards.dayUnit')}`}
                </span>
              </Text>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
