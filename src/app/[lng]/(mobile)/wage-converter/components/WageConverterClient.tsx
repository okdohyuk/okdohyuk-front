'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { Text } from '@components/basic/Text';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const DEFAULT_WEEKS_PER_MONTH = 4.345;

const parseNumber = (value: string) => {
  if (!value) return NaN;
  const normalized = value.replace(/,/g, '');
  return Number.parseFloat(normalized);
};

type WageConverterClientProps = {
  lng: Language;
};

function WageConverterClient({ lng }: WageConverterClientProps) {
  const { t } = useTranslation(lng, 'wage-converter');
  const [hourlyWage, setHourlyWage] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('40');
  const [workingDays, setWorkingDays] = useState('5');
  const [weeksPerMonth, setWeeksPerMonth] = useState(String(DEFAULT_WEEKS_PER_MONTH));
  const [copied, setCopied] = useState(false);

  const numbers = useMemo(() => {
    const hourly = parseNumber(hourlyWage);
    const weeklyHours = parseNumber(hoursPerWeek);
    const days = parseNumber(workingDays);
    const weeks = parseNumber(weeksPerMonth);

    const isValid =
      Number.isFinite(hourly) &&
      Number.isFinite(weeklyHours) &&
      Number.isFinite(days) &&
      Number.isFinite(weeks) &&
      hourly > 0 &&
      weeklyHours > 0 &&
      days > 0 &&
      weeks > 0;

    if (!isValid) {
      return { isValid: false };
    }

    const weeklyPay = hourly * weeklyHours;
    const dailyPay = weeklyPay / days;
    const monthlyPay = weeklyPay * weeks;
    const yearlyPay = monthlyPay * 12;

    return {
      isValid: true,
      hourly,
      weeklyHours,
      days,
      weeks,
      weeklyPay,
      dailyPay,
      monthlyPay,
      yearlyPay,
    };
  }, [hourlyWage, hoursPerWeek, workingDays, weeksPerMonth]);

  const formatNumber = (value: number) => new Intl.NumberFormat(lng).format(Math.round(value));

  const handleExample = () => {
    setHourlyWage('10000');
    setHoursPerWeek('40');
    setWorkingDays('5');
    setWeeksPerMonth(String(DEFAULT_WEEKS_PER_MONTH));
  };

  const handleReset = () => {
    setHourlyWage('');
    setHoursPerWeek('40');
    setWorkingDays('5');
    setWeeksPerMonth(String(DEFAULT_WEEKS_PER_MONTH));
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!numbers.isValid) return;
    const summary = t('result.summary', {
      hourly: formatNumber(numbers.hourly),
      weekly: formatNumber(numbers.weeklyPay),
      monthly: formatNumber(numbers.monthlyPay),
      yearly: formatNumber(numbers.yearlyPay),
      unit: t('result.unit'),
    });

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <Text className="font-semibold" variant="d2">
            {t('label.hourlyWage')}
          </Text>
          <Input
            type="number"
            min={0}
            step={100}
            value={hourlyWage}
            placeholder={t('placeholder.hourlyWage')}
            onChange={(event) => setHourlyWage(event.target.value)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Text className="font-semibold" variant="d2">
              {t('label.hoursPerWeek')}
            </Text>
            <Input
              type="number"
              min={0}
              step={0.5}
              value={hoursPerWeek}
              placeholder={t('placeholder.hoursPerWeek')}
              onChange={(event) => setHoursPerWeek(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text className="font-semibold" variant="d2">
              {t('label.workingDays')}
            </Text>
            <Input
              type="number"
              min={1}
              step={1}
              value={workingDays}
              placeholder={t('placeholder.workingDays')}
              onChange={(event) => setWorkingDays(event.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Text className="font-semibold" variant="d2">
              {t('label.weeksPerMonth')}
            </Text>
            <Input
              type="number"
              min={1}
              step={0.01}
              value={weeksPerMonth}
              placeholder={t('placeholder.weeksPerMonth')}
              onChange={(event) => setWeeksPerMonth(event.target.value)}
            />
            <Text className="text-xs" color="basic-5">
              {t('helper.weeksPerMonth')}
            </Text>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" className="px-3 py-1 text-sm" onClick={handleExample}>
            {t('actions.example')}
          </Button>
          <Button type="button" className="px-3 py-1 text-sm" onClick={handleReset}>
            {t('actions.reset')}
          </Button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-1">
          <Text className="text-lg font-semibold" variant="d1">
            {t('result.title')}
          </Text>
          <Text className="text-sm" color="basic-5">
            {t('result.description')}
          </Text>
        </div>
        {numbers.isValid ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200/70 p-3 dark:border-zinc-700/70">
              <Text className="text-sm" color="basic-5">
                {t('result.weekly')}
              </Text>
              <Text className="text-xl font-semibold" variant="d1">
                {formatNumber(numbers.weeklyPay)} {t('result.unit')}
              </Text>
            </div>
            <div className="rounded-2xl border border-zinc-200/70 p-3 dark:border-zinc-700/70">
              <Text className="text-sm" color="basic-5">
                {t('result.daily')}
              </Text>
              <Text className="text-xl font-semibold" variant="d1">
                {formatNumber(numbers.dailyPay)} {t('result.unit')}
              </Text>
            </div>
            <div className="rounded-2xl border border-zinc-200/70 p-3 dark:border-zinc-700/70">
              <Text className="text-sm" color="basic-5">
                {t('result.monthly')}
              </Text>
              <Text className="text-xl font-semibold" variant="d1">
                {formatNumber(numbers.monthlyPay)} {t('result.unit')}
              </Text>
            </div>
            <div className="rounded-2xl border border-zinc-200/70 p-3 dark:border-zinc-700/70">
              <Text className="text-sm" color="basic-5">
                {t('result.yearly')}
              </Text>
              <Text className="text-xl font-semibold" variant="d1">
                {formatNumber(numbers.yearlyPay)} {t('result.unit')}
              </Text>
            </div>
          </div>
        ) : (
          <Text className="text-sm" color="basic-5">
            {t('result.empty')}
          </Text>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            className="px-3 py-1 text-sm"
            onClick={handleCopy}
            disabled={!numbers.isValid}
          >
            {copied ? t('actions.copied') : t('actions.copySummary')}
          </Button>
          {numbers.isValid && (
            <Text className="text-sm" color="basic-5">
              {t('result.summary', {
                hourly: formatNumber(numbers.hourly),
                weekly: formatNumber(numbers.weeklyPay),
                monthly: formatNumber(numbers.monthlyPay),
                yearly: formatNumber(numbers.yearlyPay),
                unit: t('result.unit'),
              })}
            </Text>
          )}
        </div>
      </section>
    </div>
  );
}

export default WageConverterClient;
