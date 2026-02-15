'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, RotateCcw } from 'lucide-react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const toStartOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

interface AnniversaryCounterClientProps {
  lng: Language;
}

export default function AnniversaryCounterClient({ lng }: AnniversaryCounterClientProps) {
  const { t } = useTranslation(lng, 'anniversary-counter');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [includeToday, setIncludeToday] = useState(true);
  const [copied, setCopied] = useState(false);

  const today = useMemo(() => new Date(), []);
  const todayStart = useMemo(() => toStartOfDay(today), [today]);

  const getLabel = useCallback(
    (diffDays: number) => {
      if (diffDays === 0) return t('result.dday');
      if (diffDays > 0) return t('result.ddayMinus', { count: diffDays });
      return t('result.ddayPlus', { count: Math.abs(diffDays) });
    },
    [t],
  );

  const getStatusText = useCallback(
    (diffDays: number) => {
      if (diffDays === 0) return t('result.today');
      if (diffDays > 0) return t('result.daysLeft', { count: diffDays });
      return t('result.daysPassed', { count: Math.abs(diffDays) });
    },
    [t],
  );

  const result = useMemo(() => {
    if (!date) return null;
    const target = new Date(date);
    if (Number.isNaN(target.getTime())) return null;

    const targetStart = toStartOfDay(target);
    let diffDays = Math.round((targetStart.getTime() - todayStart.getTime()) / MS_PER_DAY);

    if (includeToday) {
      diffDays = diffDays >= 0 ? diffDays + 1 : diffDays - 1;
    }

    return {
      diffDays,
      label: getLabel(diffDays),
      statusText: getStatusText(diffDays),
      target,
    };
  }, [date, includeToday, getLabel, getStatusText, todayStart]);

  const formattedTargetDate = useMemo(() => {
    if (!result) return '-';
    return new Intl.DateTimeFormat(lng).format(result.target);
  }, [lng, result]);

  const formattedTodayDate = useMemo(
    () => new Intl.DateTimeFormat(lng).format(todayStart),
    [lng, todayStart],
  );

  useEffect(() => {
    setCopied(false);
  }, [date, title, includeToday]);

  const handleQuickDate = (amount: number) => {
    const next = formatDateInput(addDays(todayStart, amount));
    setDate(next);
  };

  const handleReset = () => {
    setTitle('');
    setDate('');
    setIncludeToday(true);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      const formattedTarget = new Intl.DateTimeFormat(lng, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(result.target);

      const copyText = t('result.copyText', {
        title: title || t('result.defaultTitle'),
        label: result.label,
        status: result.statusText,
        date: formattedTarget,
      });

      await navigator.clipboard.writeText(copyText);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy result:', error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <label
            htmlFor="anniversary-title"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.title')}
          </label>
          <Input
            id="anniversary-title"
            placeholder={t('placeholder.title')}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="anniversary-date"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.date')}
          </label>
          <Input
            id="anniversary-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <input
            id="include-today"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-point-2 focus:ring-point-1"
            checked={includeToday}
            onChange={(event) => setIncludeToday(event.target.checked)}
          />
          <label htmlFor="include-today" className="text-sm font-medium">
            {t('label.includeToday')}
          </label>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('label.quick')}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="px-3 py-2 text-xs" onClick={() => handleQuickDate(0)}>
              {t('button.today')}
            </Button>
            <Button type="button" className="px-3 py-2 text-xs" onClick={() => handleQuickDate(7)}>
              {t('button.week')}
            </Button>
            <Button
              type="button"
              className="px-3 py-2 text-xs"
              onClick={() => handleQuickDate(100)}
            >
              {t('button.hundred')}
            </Button>
            <Button
              type="button"
              className="px-3 py-2 text-xs"
              onClick={handleReset}
              disabled={!title && !date && includeToday}
            >
              <RotateCcw size={14} className="mr-1" />
              {t('button.reset')}
            </Button>
          </div>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t('label.result')}
            </p>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">
              {result ? result.label : t('result.empty')}
            </p>
          </div>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!result}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <p>{result ? result.statusText : t('result.empty')}</p>
          <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span>
              {t('result.targetDate')}: {formattedTargetDate}
            </span>
            <span>
              {t('result.todayDate')}: {formattedTodayDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
