'use client';

import React, { useMemo, useState } from 'react';
import { addMonths, format } from 'date-fns';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const parseNumber = (value: string) => {
  const normalized = value.replace(/[^0-9.-]/g, '');
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatNumber = (value: number) => value.toLocaleString();

type SavingsGoalCalculatorProps = {
  lng: Language;
};

export default function SavingsGoalCalculator({ lng }: SavingsGoalCalculatorProps) {
  const { t } = useTranslation(lng, 'savings-goal');
  const [goalAmount, setGoalAmount] = useState('5,000,000');
  const [currentAmount, setCurrentAmount] = useState('500,000');
  const [monthlyAmount, setMonthlyAmount] = useState('300,000');
  const [annualRate, setAnnualRate] = useState('2.5');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const goal = parseNumber(goalAmount);
    const current = parseNumber(currentAmount);
    const monthly = parseNumber(monthlyAmount);
    const annual = parseNumber(annualRate);
    const rate = annual > 0 ? annual / 100 / 12 : 0;

    if (goal <= 0) {
      return {
        goal,
        current,
        monthly,
        remaining: 0,
        monthsNeeded: 0,
        targetDate: null,
        status: 'invalidGoal',
      };
    }

    if (goal <= current) {
      return {
        goal,
        current,
        monthly,
        remaining: 0,
        monthsNeeded: 0,
        targetDate: new Date(),
        status: 'alreadyReached',
      };
    }

    if ((monthly <= 0 && rate <= 0) || (monthly <= 0 && current <= 0)) {
      return {
        goal,
        current,
        monthly,
        remaining: Math.max(goal - current, 0),
        monthsNeeded: null,
        targetDate: null,
        status: 'unreachable',
      };
    }

    let monthsNeeded = 0;

    if (rate <= 0) {
      monthsNeeded = (goal - current) / monthly;
    } else {
      const base = current + monthly / rate;
      const ratio = (goal + monthly / rate) / base;
      monthsNeeded = ratio > 1 ? Math.log(ratio) / Math.log(1 + rate) : 0;
    }

    const roundedMonths = Math.ceil(monthsNeeded);
    const targetDate = addMonths(new Date(), roundedMonths);

    return {
      goal,
      current,
      monthly,
      remaining: Math.max(goal - current, 0),
      monthsNeeded,
      roundedMonths,
      targetDate,
      status: 'ok',
    };
  }, [goalAmount, currentAmount, monthlyAmount, annualRate]);

  const summaryText = useMemo(() => {
    if (result.status !== 'ok') {
      return '';
    }

    const monthsValue = result.roundedMonths ?? 0;
    const targetDate = result.targetDate ? format(result.targetDate, 'yyyy-MM-dd') : '-';

    return t('summary', {
      months: monthsValue,
      targetDate,
      remaining: formatNumber(result.remaining),
      goal: formatNumber(result.goal),
    });
  }, [result, t]);

  const handleCopy = async () => {
    if (!summaryText) {
      return;
    }
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setGoalAmount('');
    setCurrentAmount('');
    setMonthlyAmount('');
    setAnnualRate('');
  };

  const handleExample = () => {
    setGoalAmount('10,000,000');
    setCurrentAmount('1,500,000');
    setMonthlyAmount('400,000');
    setAnnualRate('3');
  };

  return (
    <div className="space-y-4">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1" htmlFor="goalAmount">
            <Text className="t-d-2 t-basic-2">{t('labels.goalAmount')}</Text>
            <Input
              id="goalAmount"
              inputMode="numeric"
              placeholder={t('placeholders.goalAmount')}
              value={goalAmount}
              onChange={(event) => setGoalAmount(event.target.value)}
            />
          </label>
          <label className="space-y-1" htmlFor="currentAmount">
            <Text className="t-d-2 t-basic-2">{t('labels.currentAmount')}</Text>
            <Input
              id="currentAmount"
              inputMode="numeric"
              placeholder={t('placeholders.currentAmount')}
              value={currentAmount}
              onChange={(event) => setCurrentAmount(event.target.value)}
            />
          </label>
          <label className="space-y-1" htmlFor="monthlyAmount">
            <Text className="t-d-2 t-basic-2">{t('labels.monthlyAmount')}</Text>
            <Input
              id="monthlyAmount"
              inputMode="numeric"
              placeholder={t('placeholders.monthlyAmount')}
              value={monthlyAmount}
              onChange={(event) => setMonthlyAmount(event.target.value)}
            />
          </label>
          <label className="space-y-1" htmlFor="annualRate">
            <Text className="t-d-2 t-basic-2">{t('labels.annualRate')}</Text>
            <Input
              id="annualRate"
              inputMode="decimal"
              placeholder={t('placeholders.annualRate')}
              value={annualRate}
              onChange={(event) => setAnnualRate(event.target.value)}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleExample}>
            {t('actions.fillExample')}
          </Button>
          <Button type="button" className="bg-gray-500 hover:bg-gray-400" onClick={handleReset}>
            {t('actions.reset')}
          </Button>
          <Button
            type="button"
            className="bg-emerald-500 hover:bg-emerald-400"
            onClick={handleCopy}
          >
            {copied ? t('actions.copied') : t('actions.copySummary')}
          </Button>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text className="t-d-1 t-basic-1">{t('result.title')}</Text>
        <div className="grid gap-2 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-md bg-gray-50 p-3 text-sm text-gray-700">
            <span>{t('result.remaining')}</span>
            <span className="font-semibold">{formatNumber(result.remaining)}</span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-gray-50 p-3 text-sm text-gray-700">
            <span>{t('result.monthsNeeded')}</span>
            <span className="font-semibold">
              {result.status === 'ok'
                ? `${Math.max(0, Math.ceil(result.monthsNeeded ?? 0))} ${t('result.monthsUnit')}`
                : '-'}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-gray-50 p-3 text-sm text-gray-700 md:col-span-2">
            <span>{t('result.targetDate')}</span>
            <span className="font-semibold">
              {result.status === 'ok' && result.targetDate
                ? format(result.targetDate, 'yyyy-MM-dd')
                : '-'}
            </span>
          </div>
        </div>

        {result.status === 'invalidGoal' ? (
          <Text className="t-d-2 text-red-500">{t('messages.invalidGoal')}</Text>
        ) : null}
        {result.status === 'unreachable' ? (
          <Text className="t-d-2 text-red-500">{t('messages.unreachable')}</Text>
        ) : null}
        {result.status === 'alreadyReached' ? (
          <Text className="t-d-2 text-emerald-600">{t('messages.alreadyReached')}</Text>
        ) : null}
        {summaryText ? (
          <div className="rounded-md bg-gray-100 p-3 text-sm text-gray-700">{summaryText}</div>
        ) : null}
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-4 text-sm text-gray-600')}>
        <Text className="t-d-2 t-basic-1">{t('notes.title')}</Text>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t('notes.item1')}</li>
          <li>{t('notes.item2')}</li>
          <li>{t('notes.item3')}</li>
        </ul>
      </div>
    </div>
  );
}
