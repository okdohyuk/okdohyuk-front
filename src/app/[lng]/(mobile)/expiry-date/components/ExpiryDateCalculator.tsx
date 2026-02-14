'use client';

import React, { useMemo, useState } from 'react';
import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  format,
  isValid,
  startOfDay,
} from 'date-fns';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

type ExpiryDateCalculatorProps = {
  lng: Language;
};

type UnitValue = 'days' | 'weeks' | 'months';

const unitOptions: Array<{ value: UnitValue; labelKey: string }> = [
  { value: 'days', labelKey: 'unit.days' },
  { value: 'weeks', labelKey: 'unit.weeks' },
  { value: 'months', labelKey: 'unit.months' },
];

const formatDate = (date: Date) => format(date, 'yyyy.MM.dd');

const parseDateInput = (value: string) => {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return isValid(parsed) ? parsed : null;
};

export default function ExpiryDateCalculator({ lng }: ExpiryDateCalculatorProps) {
  const { t } = useTranslation(lng, 'expiry-date');
  const today = useMemo(() => startOfDay(new Date()), []);

  const [startDate, setStartDate] = useState(() => format(today, 'yyyy-MM-dd'));
  const [amount, setAmount] = useState('7');
  const [unit, setUnit] = useState<UnitValue>('days');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const parsedStart = parseDateInput(startDate);
    const amountValue = Number(amount);

    if (!parsedStart || Number.isNaN(amountValue) || amountValue <= 0) {
      return null;
    }

    let expirationDate = parsedStart;
    if (unit === 'days') expirationDate = addDays(parsedStart, amountValue);
    if (unit === 'weeks') expirationDate = addWeeks(parsedStart, amountValue);
    if (unit === 'months') expirationDate = addMonths(parsedStart, amountValue);

    const daysLeft = differenceInCalendarDays(expirationDate, today);

    return {
      expirationDate,
      daysLeft,
    };
  }, [amount, startDate, unit, today]);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(formatDate(result.expirationDate));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setStartDate(format(today, 'yyyy-MM-dd'));
    setAmount('7');
    setUnit('days');
    setCopied(false);
  };

  const statusLabel = useMemo(() => {
    if (!result) return '';
    if (result.daysLeft === 0) return t('result.status.today');
    if (result.daysLeft < 0) return t('result.status.expired');
    return t('result.status.remaining');
  }, [result, t]);

  return (
    <div className="space-y-4">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <Text variant="d2" color="basic-3">
            {t('helper')}
          </Text>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Text variant="d3" color="basic-4">
                {t('label.startDate')}
              </Text>
              <Input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Text variant="d3" color="basic-4">
                {t('label.amount')}
              </Text>
              <Input
                type="number"
                min={1}
                inputMode="numeric"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Text variant="d3" color="basic-4">
                {t('label.unit')}
              </Text>
              <Select value={unit} onValueChange={(value) => setUnit(value as UnitValue)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleReset}>
              {t('button.reset')}
            </Button>
            <Button type="button" onClick={() => setStartDate(format(today, 'yyyy-MM-dd'))}>
              {t('button.today')}
            </Button>
          </div>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex items-center justify-between">
          <Text variant="d1" color="basic-1">
            {t('result.title')}
          </Text>
          <Text variant="c1" color="basic-4">
            {t('result.notice')}
          </Text>
        </div>
        {result ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Text variant="t3" color="basic-2">
                {formatDate(result.expirationDate)}
              </Text>
              <Button type="button" onClick={handleCopy}>
                {copied ? t('button.copied') : t('button.copy')}
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Text variant="d2" color="basic-2">
                {statusLabel}
              </Text>
              <Text variant="d2" color="basic-4">
                {t('result.days', { count: Math.abs(result.daysLeft) })}
              </Text>
            </div>
          </div>
        ) : (
          <Text variant="d2" color="basic-5">
            {t('result.empty')}
          </Text>
        )}
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-4')}>
        <Text variant="d2" color="basic-2">
          {t('tips.title')}
        </Text>
        <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
          <li>{t('tips.line1')}</li>
          <li>{t('tips.line2')}</li>
          <li>{t('tips.line3')}</li>
        </ul>
      </div>
    </div>
  );
}
