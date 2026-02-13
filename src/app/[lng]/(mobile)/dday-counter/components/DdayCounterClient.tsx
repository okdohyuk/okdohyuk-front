'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { addDays, differenceInCalendarDays, format, isValid, parseISO, startOfDay } from 'date-fns';
import { CalendarDays, Clipboard, ClipboardCheck, RotateCcw } from 'lucide-react';
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

type DdayCounterClientProps = {
  lng: Language;
};

export default function DdayCounterClient({ lng }: DdayCounterClientProps) {
  const { t } = useTranslation(lng, 'dday-counter');
  const [targetDate, setTargetDate] = useState('');
  const [label, setLabel] = useState('');
  const [copied, setCopied] = useState(false);

  const today = useMemo(() => startOfDay(new Date()), []);

  const parsedDate = useMemo(() => {
    if (!targetDate) return null;
    return parseISO(targetDate);
  }, [targetDate]);

  const isValidDate = parsedDate ? isValid(parsedDate) : false;

  const diffDays = useMemo(() => {
    if (!parsedDate || !isValidDate) return null;
    return differenceInCalendarDays(startOfDay(parsedDate), today);
  }, [parsedDate, isValidDate, today]);

  const formattedDate = useMemo(() => {
    if (!parsedDate || !isValidDate) return '';
    return new Intl.DateTimeFormat(lng, { dateStyle: 'full' }).format(parsedDate);
  }, [parsedDate, isValidDate, lng]);

  const ddayText = useMemo(() => {
    if (diffDays === null) return '';
    if (diffDays === 0) return t('result.today');
    if (diffDays > 0) return t('result.future', { days: diffDays });
    return t('result.past', { days: Math.abs(diffDays) });
  }, [diffDays, t]);

  const relativeText = useMemo(() => {
    if (diffDays === null) return '';
    if (diffDays === 0) return t('result.today');
    if (diffDays > 0) return t('result.daysUntil', { days: diffDays });
    return t('result.daysSince', { days: Math.abs(diffDays) });
  }, [diffDays, t]);

  useEffect(() => {
    setCopied(false);
  }, [ddayText, formattedDate, label]);

  const handleCopy = async () => {
    if (!ddayText || !formattedDate) return;
    const labelText = label.trim() ? label.trim() : t('result.defaultLabel');
    const value = `${labelText}: ${ddayText} (${formattedDate})`;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy d-day result:', error);
    }
  };

  const setOffset = (offset: number) => {
    const next = addDays(today, offset);
    setTargetDate(format(next, 'yyyy-MM-dd'));
  };

  const handleClear = () => {
    setTargetDate('');
    setLabel('');
    setCopied(false);
  };

  return (
    <div className="space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-point-2" />
          <Text variant="d2" className="font-semibold">
            {t('label.section')}
          </Text>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="dday-date"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.date')}
          </label>
          <Input
            id="dday-date"
            type="date"
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
          />
          <Text variant="c1" color="basic-5">
            {t('helper.date')}
          </Text>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="dday-label"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.title')}
          </label>
          <Input
            id="dday-label"
            placeholder={t('placeholder.title')}
            value={label}
            onChange={(event) => setLabel(event.target.value)}
          />
          <Text variant="c1" color="basic-5">
            {t('helper.title')}
          </Text>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setOffset(0)}>
            {t('quick.today')}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setOffset(7)}>
            {t('quick.week')}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setOffset(30)}>
            {t('quick.month')}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setOffset(100)}>
            {t('quick.hundred')}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={handleClear}>
            <RotateCcw className="mr-1 h-4 w-4" />
            {t('button.clear')}
          </Button>
        </div>
        {!isValidDate && targetDate ? (
          <Text variant="c1" className="text-red-500">
            {t('error.invalidDate')}
          </Text>
        ) : null}
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <Text variant="d2" className="font-semibold">
            {t('result.title')}
          </Text>
          <Button
            type="button"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleCopy}
            disabled={!ddayText}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
        {ddayText ? (
          <div className="space-y-2">
            <Text variant="t2" className="font-black text-point-1">
              {label.trim() ? label.trim() : t('result.defaultLabel')}
            </Text>
            <Text variant="t1" className="font-black text-zinc-900 dark:text-white">
              {ddayText}
            </Text>
            <Text variant="d2" color="basic-4">
              {relativeText}
            </Text>
            <Text variant="c1" color="basic-5">
              {t('result.date', { date: formattedDate })}
            </Text>
          </div>
        ) : (
          <Text variant="d2" color="basic-5">
            {t('result.empty')}
          </Text>
        )}
      </div>
    </div>
  );
}
