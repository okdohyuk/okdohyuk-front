'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck } from 'lucide-react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface IsoWeekToolboxClientProps {
  lng: Language;
}

const formatDate = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const parseDateInput = (value: string) => {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const getIsoWeekInfo = (date: Date) => {
  const target = new Date(date.getTime());
  const dayNr = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);

  const isoYear = target.getFullYear();
  const firstThursday = new Date(isoYear, 0, 4);
  const firstDayNr = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDayNr + 3);

  const weekNumber =
    1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000));

  const weekStart = new Date(date.getTime());
  weekStart.setDate(weekStart.getDate() - dayNr);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart.getTime());
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return {
    isoYear,
    weekNumber,
    weekStart,
    weekEnd,
  };
};

const isoWeekToRange = (isoYear: number, week: number) => {
  const jan4 = new Date(isoYear, 0, 4);
  const dayNr = (jan4.getDay() + 6) % 7;
  const weekStart = new Date(jan4.getTime());
  weekStart.setDate(jan4.getDate() - dayNr + (week - 1) * 7);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart.getTime());
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
};

export default function IsoWeekToolboxClient({ lng }: IsoWeekToolboxClientProps) {
  const { t } = useTranslation(lng, 'iso-week-toolbox');
  const [dateInput, setDateInput] = useState('');
  const [isoYearInput, setIsoYearInput] = useState('');
  const [isoWeekInput, setIsoWeekInput] = useState('');
  const [listBaseDate, setListBaseDate] = useState('');
  const [listCount, setListCount] = useState('4');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const dateInfo = useMemo(() => {
    const date = parseDateInput(dateInput);
    if (!date) return null;
    return getIsoWeekInfo(date);
  }, [dateInput]);

  const rangeInfo = useMemo(() => {
    const isoYear = Number(isoYearInput);
    const isoWeek = Number(isoWeekInput);
    if (!isoYear || !isoWeek || Number.isNaN(isoYear) || Number.isNaN(isoWeek)) return null;
    if (isoWeek < 1 || isoWeek > 53) return null;
    return isoWeekToRange(isoYear, isoWeek);
  }, [isoYearInput, isoWeekInput]);

  const listInfo = useMemo(() => {
    const base = parseDateInput(listBaseDate);
    if (!base) return [];
    const count = Math.max(1, Math.min(12, Number(listCount) || 1));
    const baseInfo = getIsoWeekInfo(base);
    return Array.from({ length: count }, (_, index) => {
      const weekOffsetDate = new Date(baseInfo.weekStart.getTime());
      weekOffsetDate.setDate(weekOffsetDate.getDate() + index * 7);
      const info = getIsoWeekInfo(weekOffsetDate);
      return {
        isoYear: info.isoYear,
        weekNumber: info.weekNumber,
        start: formatDate(info.weekStart),
        end: formatDate(info.weekEnd),
      };
    });
  }, [listBaseDate, listCount]);

  const handleCopy = useCallback(async (value: string, key: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1600);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy value:', error);
    }
  }, []);

  const handleNow = () => {
    const today = new Date();
    setDateInput(formatDate(today));
    setListBaseDate(formatDate(today));
  };

  const handleClear = () => {
    setDateInput('');
    setIsoYearInput('');
    setIsoWeekInput('');
    setListBaseDate('');
    setListCount('4');
    setCopiedKey(null);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleNow} className="px-3 py-2 text-xs">
          {t('button.today')}
        </Button>
        <Button type="button" onClick={handleClear} className="px-3 py-2 text-xs">
          {t('button.clear')}
        </Button>
      </div>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="space-y-1">
          <Text variant="t3">{t('section.dateToWeek.title')}</Text>
          <Text variant="d3" color="basic-5">
            {t('section.dateToWeek.description')}
          </Text>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="iso-date-input"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('section.dateToWeek.label.date')}
          </label>
          <Input
            id="iso-date-input"
            type="date"
            value={dateInput}
            onChange={(event) => setDateInput(event.target.value)}
            placeholder={t('section.dateToWeek.placeholder')}
          />
          <Text variant="c1" color="basic-6">
            {t('section.dateToWeek.helper')}
          </Text>
        </div>

        {dateInfo ? (
          <div className="grid gap-3 md:grid-cols-2">
            {[
              {
                key: 'iso-year',
                label: t('section.dateToWeek.label.isoYear'),
                value: String(dateInfo.isoYear),
              },
              {
                key: 'iso-week',
                label: t('section.dateToWeek.label.isoWeek'),
                value: String(dateInfo.weekNumber),
              },
              {
                key: 'week-start',
                label: t('section.dateToWeek.label.weekStart'),
                value: formatDate(dateInfo.weekStart),
              },
              {
                key: 'week-end',
                label: t('section.dateToWeek.label.weekEnd'),
                value: formatDate(dateInfo.weekEnd),
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex flex-col gap-2 rounded-xl border border-zinc-200/70 bg-white/70 p-3 dark:border-zinc-700/70 dark:bg-zinc-900/70"
              >
                <div className="flex items-center justify-between gap-2">
                  <Text variant="d3" color="basic-4">
                    {item.label}
                  </Text>
                  <Button
                    type="button"
                    onClick={() => handleCopy(item.value, item.key)}
                    className="flex items-center gap-2 px-3 py-2 text-xs"
                  >
                    {copiedKey === item.key ? (
                      <ClipboardCheck size={16} />
                    ) : (
                      <Clipboard size={16} />
                    )}
                    {copiedKey === item.key ? t('button.copied') : t('button.copy')}
                  </Button>
                </div>
                <Text variant="d2" className="font-mono">
                  {item.value}
                </Text>
              </div>
            ))}
          </div>
        ) : (
          <Text variant="d3" color="basic-6">
            {t('status.invalidDate')}
          </Text>
        )}
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="space-y-1">
          <Text variant="t3">{t('section.weekToRange.title')}</Text>
          <Text variant="d3" color="basic-5">
            {t('section.weekToRange.description')}
          </Text>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="iso-year-input"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('section.weekToRange.label.isoYear')}
            </label>
            <Input
              id="iso-year-input"
              type="number"
              min={1}
              value={isoYearInput}
              onChange={(event) => setIsoYearInput(event.target.value)}
              placeholder={t('section.weekToRange.placeholder.year')}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="iso-week-input"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('section.weekToRange.label.isoWeek')}
            </label>
            <Input
              id="iso-week-input"
              type="number"
              min={1}
              max={53}
              value={isoWeekInput}
              onChange={(event) => setIsoWeekInput(event.target.value)}
              placeholder={t('section.weekToRange.placeholder.week')}
            />
          </div>
        </div>

        {rangeInfo ? (
          <div className="grid gap-3 md:grid-cols-2">
            {[
              {
                key: 'range-start',
                label: t('section.weekToRange.label.start'),
                value: formatDate(rangeInfo.weekStart),
              },
              {
                key: 'range-end',
                label: t('section.weekToRange.label.end'),
                value: formatDate(rangeInfo.weekEnd),
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex flex-col gap-2 rounded-xl border border-zinc-200/70 bg-white/70 p-3 dark:border-zinc-700/70 dark:bg-zinc-900/70"
              >
                <div className="flex items-center justify-between gap-2">
                  <Text variant="d3" color="basic-4">
                    {item.label}
                  </Text>
                  <Button
                    type="button"
                    onClick={() => handleCopy(item.value, item.key)}
                    className="flex items-center gap-2 px-3 py-2 text-xs"
                  >
                    {copiedKey === item.key ? (
                      <ClipboardCheck size={16} />
                    ) : (
                      <Clipboard size={16} />
                    )}
                    {copiedKey === item.key ? t('button.copied') : t('button.copy')}
                  </Button>
                </div>
                <Text variant="d2" className="font-mono">
                  {item.value}
                </Text>
              </div>
            ))}
          </div>
        ) : (
          <Text variant="d3" color="basic-6">
            {t('status.invalidWeek')}
          </Text>
        )}
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="space-y-1">
          <Text variant="t3">{t('section.weekList.title')}</Text>
          <Text variant="d3" color="basic-5">
            {t('section.weekList.description')}
          </Text>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="list-base-input"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('section.weekList.label.base')}
            </label>
            <Input
              id="list-base-input"
              type="date"
              value={listBaseDate}
              onChange={(event) => setListBaseDate(event.target.value)}
              placeholder={t('section.weekList.placeholder.base')}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="list-count-input"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('section.weekList.label.count')}
            </label>
            <Input
              id="list-count-input"
              type="number"
              min={1}
              max={12}
              value={listCount}
              onChange={(event) => setListCount(event.target.value)}
              placeholder={t('section.weekList.placeholder.count')}
            />
          </div>
        </div>

        {listInfo.length > 0 ? (
          <div className="space-y-2">
            {listInfo.map((week) => (
              <div
                key={`${week.isoYear}-${week.weekNumber}`}
                className="flex flex-col gap-1 rounded-xl border border-zinc-200/70 bg-white/70 p-3 dark:border-zinc-700/70 dark:bg-zinc-900/70"
              >
                <Text variant="d3" color="basic-4">
                  {t('section.weekList.label.week', {
                    year: week.isoYear,
                    week: week.weekNumber,
                  })}
                </Text>
                <Text variant="d2" className="font-mono">
                  {week.start} - {week.end}
                </Text>
              </div>
            ))}
          </div>
        ) : (
          <Text variant="d3" color="basic-6">
            {t('section.weekList.empty')}
          </Text>
        )}
      </section>
    </div>
  );
}
