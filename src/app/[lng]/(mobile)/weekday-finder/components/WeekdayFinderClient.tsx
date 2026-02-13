'use client';

import React, { useMemo, useState } from 'react';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface WeekdayFinderClientProps {
  lng: Language;
}

const localeMap: Record<Language, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

const formatDateInput = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
};

const getIsoWeekNumber = (date: Date) => {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  return Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

const getDayOfYear = (date: Date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
};

export default function WeekdayFinderClient({ lng }: WeekdayFinderClientProps) {
  const { t } = useTranslation(lng, 'weekday-finder');
  const [dateValue, setDateValue] = useState(() => formatDateInput(new Date()));

  const selectedDate = useMemo(() => {
    if (!dateValue) return null;
    return new Date(`${dateValue}T00:00:00`);
  }, [dateValue]);

  const locale = localeMap[lng];

  const results = useMemo(() => {
    if (!selectedDate || Number.isNaN(selectedDate.getTime())) {
      return {
        formattedDate: t('empty'),
        dayOfWeek: t('empty'),
        isWeekend: t('empty'),
        isoWeek: t('empty'),
        dayOfYear: t('empty'),
      };
    }

    const formattedDate = new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(
      selectedDate,
    );
    const dayOfWeek = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(selectedDate);
    const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
    const isoWeek = getIsoWeekNumber(selectedDate).toString();
    const dayOfYear = getDayOfYear(selectedDate).toString();

    return {
      formattedDate,
      dayOfWeek,
      isWeekend: isWeekend ? t('result.weekend') : t('result.weekday'),
      isoWeek,
      dayOfYear,
    };
  }, [selectedDate, locale, t]);

  const shiftDate = (offset: number) => {
    const base = selectedDate ? new Date(selectedDate) : new Date();
    base.setDate(base.getDate() + offset);
    setDateValue(formatDateInput(base));
  };

  const resultItems = [
    { label: t('result.formattedDate'), value: results.formattedDate },
    { label: t('result.dayOfWeek'), value: results.dayOfWeek },
    { label: t('result.isWeekend'), value: results.isWeekend },
    { label: t('result.isoWeek'), value: results.isoWeek },
    { label: t('result.dayOfYear'), value: results.dayOfYear },
  ];

  return (
    <div className="w-full space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <label
          htmlFor="weekday-date"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.date')}
        </label>
        <Input
          id="weekday-date"
          type="date"
          value={dateValue}
          onChange={(e) => setDateValue(e.target.value)}
          className="max-w-xs"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('helper')}</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" className="px-3 py-1 text-sm" onClick={() => shiftDate(-1)}>
            {t('button.yesterday')}
          </Button>
          <Button type="button" className="px-3 py-1 text-sm" onClick={() => shiftDate(0)}>
            {t('button.today')}
          </Button>
          <Button type="button" className="px-3 py-1 text-sm" onClick={() => shiftDate(1)}>
            {t('button.tomorrow')}
          </Button>
        </div>
      </section>

      <section
        className={cn(
          SERVICE_PANEL_SOFT,
          SERVICE_CARD_INTERACTIVE,
          'grid gap-4 p-4 sm:grid-cols-2',
        )}
      >
        {resultItems.map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {item.label}
            </span>
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {item.value}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
