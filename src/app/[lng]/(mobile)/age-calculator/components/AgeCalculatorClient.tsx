'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  addMonths,
  addYears,
  differenceInCalendarDays,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  format,
  isAfter,
  isBefore,
  isEqual,
  isValid,
  parseISO,
  setYear,
} from 'date-fns';
import { Clipboard, ClipboardCheck } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { H1, Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface AgeCalculatorClientProps {
  lng: Language;
}

const todayString = () => format(new Date(), 'yyyy-MM-dd');

export default function AgeCalculatorClient({ lng }: AgeCalculatorClientProps) {
  const { t } = useTranslation(lng, 'age-calculator');
  const [birthDate, setBirthDate] = useState('');
  const [referenceDate, setReferenceDate] = useState(todayString());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [birthDate, referenceDate]);

  const result = useMemo(() => {
    if (!birthDate) return { error: null, data: null };

    const birth = parseISO(birthDate);
    const reference = parseISO(referenceDate || todayString());

    if (!isValid(birth) || !isValid(reference)) {
      return { error: t('messages.invalid'), data: null };
    }

    if (isAfter(birth, reference)) {
      return { error: t('messages.futureBirth'), data: null };
    }

    const years = differenceInYears(reference, birth);
    const afterYears = addYears(birth, years);
    const months = differenceInMonths(reference, afterYears);
    const afterMonths = addMonths(afterYears, months);
    const days = differenceInDays(reference, afterMonths);

    let nextBirthday = setYear(birth, reference.getFullYear());
    if (isBefore(nextBirthday, reference) && !isEqual(nextBirthday, reference)) {
      nextBirthday = addYears(nextBirthday, 1);
    }
    const daysUntil = differenceInCalendarDays(nextBirthday, reference);

    return {
      error: null,
      data: {
        years,
        months,
        days,
        nextBirthday,
        daysUntil,
      },
    };
  }, [birthDate, referenceDate, t]);

  const handleCopy = async () => {
    if (!result.data) return;
    const summary = t('results.summary', {
      years: result.data.years,
      months: result.data.months,
      days: result.data.days,
      nextBirthday: format(result.data.nextBirthday, 'yyyy-MM-dd'),
      daysUntil: result.data.daysUntil,
    });

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy summary:', error);
    }
  };

  const handleToday = () => {
    setReferenceDate(todayString());
  };

  const handleClear = () => {
    setBirthDate('');
    setReferenceDate(todayString());
    setCopied(false);
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL, 'space-y-4 p-4 md:p-5')}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Text asChild variant="d2" color="basic-4">
              <label htmlFor="birth-date">{t('labels.birthDate')}</label>
            </Text>
            <Input
              id="birth-date"
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text asChild variant="d2" color="basic-4">
              <label htmlFor="reference-date">{t('labels.referenceDate')}</label>
            </Text>
            <Input
              id="reference-date"
              type="date"
              value={referenceDate}
              onChange={(event) => setReferenceDate(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" className="px-3 py-2 text-xs" onClick={handleToday}>
                {t('actions.today')}
              </Button>
              <Button
                type="button"
                className="px-3 py-2 text-xs bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-white"
                onClick={handleClear}
              >
                {t('actions.clear')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4 md:p-5')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <H1 className="text-2xl md:text-3xl">{t('results.title')}</H1>
          <Button
            type="button"
            className="flex items-center gap-2 px-3 py-2 text-xs"
            onClick={handleCopy}
            disabled={!result.data}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('messages.copied') : t('actions.copy')}
          </Button>
        </div>
        {!birthDate && (
          <Text variant="d2" color="basic-5">
            {t('results.empty')}
          </Text>
        )}
        {result.error && (
          <Text variant="d2" className="text-red-500 dark:text-red-400">
            {result.error}
          </Text>
        )}
        {result.data && !result.error && (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-white/70 p-3 shadow-sm dark:bg-zinc-900/70">
                <Text variant="c1" color="basic-5">
                  {t('results.ageYears')}
                </Text>
                <Text asChild variant="t3">
                  <p className="mt-1 font-semibold">
                    {t('results.yearsValue', { years: result.data.years })}
                  </p>
                </Text>
              </div>
              <div className="rounded-2xl bg-white/70 p-3 shadow-sm dark:bg-zinc-900/70">
                <Text variant="c1" color="basic-5">
                  {t('results.ageFullLabel')}
                </Text>
                <Text asChild variant="d1">
                  <p className="mt-1 font-semibold">
                    {t('results.ageFull', {
                      years: result.data.years,
                      months: result.data.months,
                      days: result.data.days,
                    })}
                  </p>
                </Text>
              </div>
              <div className="rounded-2xl bg-white/70 p-3 shadow-sm dark:bg-zinc-900/70">
                <Text variant="c1" color="basic-5">
                  {t('results.daysUntil')}
                </Text>
                <Text asChild variant="t3">
                  <p className="mt-1 font-semibold">
                    {t('results.daysUntilValue', { days: result.data.daysUntil })}
                  </p>
                </Text>
              </div>
            </div>
            <div className="rounded-2xl bg-white/70 p-3 text-sm text-zinc-700 shadow-sm dark:bg-zinc-900/70 dark:text-zinc-200">
              <Text asChild variant="d2" color="basic-3">
                <p>
                  {t('results.nextBirthday', {
                    nextBirthday: format(result.data.nextBirthday, 'yyyy-MM-dd'),
                  })}
                </p>
              </Text>
            </div>
          </div>
        )}
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-4')}>
        <Text asChild variant="d2" color="basic-4">
          <p className="font-semibold">{t('example.title')}</p>
        </Text>
        <Text variant="d2" color="basic-5">
          {t('example.text')}
        </Text>
      </div>
    </div>
  );
}
