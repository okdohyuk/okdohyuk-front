'use client';

import React, { useMemo, useState } from 'react';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';
import { H1, Text } from '@components/basic/Text';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';

const localeMap: Record<Language, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

const formatNumber = (value: number, lng: Language) =>
  Number.isFinite(value) ? value.toLocaleString(localeMap[lng], { maximumFractionDigits: 2 }) : '0';

const toNumber = (value: string) => {
  if (!value.trim()) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const sampleValues = {
  totalDays: '15',
  carryoverDays: '2',
  usedDays: '6',
  usedHalfDays: '1',
  plannedDays: '3',
};

interface LeaveBalanceClientProps {
  lng: Language;
}

export default function LeaveBalanceClient({ lng }: LeaveBalanceClientProps) {
  const { t } = useTranslation(lng, 'leave-balance');
  const [totalDays, setTotalDays] = useState('');
  const [carryoverDays, setCarryoverDays] = useState('');
  const [usedDays, setUsedDays] = useState('');
  const [usedHalfDays, setUsedHalfDays] = useState('');
  const [plannedDays, setPlannedDays] = useState('');
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle');

  const results = useMemo(() => {
    const total = toNumber(totalDays);
    const carryover = toNumber(carryoverDays);
    const used = toNumber(usedDays);
    const usedHalf = toNumber(usedHalfDays);
    const planned = toNumber(plannedDays);

    const availableTotal = total + carryover;
    const usedTotal = used + usedHalf * 0.5;
    const remaining = availableTotal - usedTotal;
    const remainingAfterPlan = remaining - planned;
    const usedPercent = availableTotal > 0 ? (usedTotal / availableTotal) * 100 : 0;

    return {
      total,
      carryover,
      used,
      usedHalf,
      planned,
      availableTotal,
      usedTotal,
      remaining,
      remainingAfterPlan,
      usedPercent,
    };
  }, [totalDays, carryoverDays, usedDays, usedHalfDays, plannedDays]);

  const handleReset = () => {
    setTotalDays('');
    setCarryoverDays('');
    setUsedDays('');
    setUsedHalfDays('');
    setPlannedDays('');
    setCopyState('idle');
  };

  const handleSample = () => {
    setTotalDays(sampleValues.totalDays);
    setCarryoverDays(sampleValues.carryoverDays);
    setUsedDays(sampleValues.usedDays);
    setUsedHalfDays(sampleValues.usedHalfDays);
    setPlannedDays(sampleValues.plannedDays);
    setCopyState('idle');
  };

  const summaryText = [
    `${t('summary.title')}: ${formatNumber(results.availableTotal, lng)}${t('summary.days')}`,
    `${t('summary.used')}: ${formatNumber(results.usedTotal, lng)}${t('summary.days')}`,
    `${t('summary.remaining')}: ${formatNumber(results.remaining, lng)}${t('summary.days')}`,
    `${t('summary.remainingAfterPlan')}: ${formatNumber(results.remainingAfterPlan, lng)}${t(
      'summary.days',
    )}`,
  ].join('\n');

  const copyLabel = useMemo(() => {
    if (copyState === 'success') return t('actions.copySuccess');
    if (copyState === 'error') return t('actions.copyError');
    return t('actions.copy');
  }, [copyState, t]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopyState('success');
    } catch (error) {
      setCopyState('error');
    } finally {
      window.setTimeout(() => setCopyState('idle'), 2000);
    }
  };

  const hasInvalidTotal = results.availableTotal <= 0;
  const isOverused = results.usedTotal > results.availableTotal;
  const isNegativeRemaining = results.remaining < 0;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <header className="space-y-2">
        <H1>{t('title')}</H1>
        <Text variant="d2" color="basic-4">
          {t('description')}
        </Text>
      </header>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="grid gap-4 md:grid-cols-2">
          <label htmlFor="totalDays" className="space-y-2">
            <Text variant="d2" color="basic-3">
              {t('labels.totalDays')}
            </Text>
            <Input
              id="totalDays"
              type="number"
              inputMode="decimal"
              placeholder={t('placeholders.totalDays')}
              value={totalDays}
              onChange={(event) => setTotalDays(event.target.value)}
            />
          </label>
          <label htmlFor="carryoverDays" className="space-y-2">
            <Text variant="d2" color="basic-3">
              {t('labels.carryoverDays')}
            </Text>
            <Input
              id="carryoverDays"
              type="number"
              inputMode="decimal"
              placeholder={t('placeholders.carryoverDays')}
              value={carryoverDays}
              onChange={(event) => setCarryoverDays(event.target.value)}
            />
          </label>
          <label htmlFor="usedDays" className="space-y-2">
            <Text variant="d2" color="basic-3">
              {t('labels.usedDays')}
            </Text>
            <Input
              id="usedDays"
              type="number"
              inputMode="decimal"
              placeholder={t('placeholders.usedDays')}
              value={usedDays}
              onChange={(event) => setUsedDays(event.target.value)}
            />
          </label>
          <label htmlFor="usedHalfDays" className="space-y-2">
            <Text variant="d2" color="basic-3">
              {t('labels.usedHalfDays')}
            </Text>
            <Input
              id="usedHalfDays"
              type="number"
              inputMode="decimal"
              placeholder={t('placeholders.usedHalfDays')}
              value={usedHalfDays}
              onChange={(event) => setUsedHalfDays(event.target.value)}
            />
          </label>
          <label htmlFor="plannedDays" className="space-y-2">
            <Text variant="d2" color="basic-3">
              {t('labels.plannedDays')}
            </Text>
            <Input
              id="plannedDays"
              type="number"
              inputMode="decimal"
              placeholder={t('placeholders.plannedDays')}
              value={plannedDays}
              onChange={(event) => setPlannedDays(event.target.value)}
            />
          </label>
        </div>

        <Text variant="c1" color="basic-5">
          {t('hint')}
        </Text>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSample} className="min-w-[110px]">
            {t('actions.sample')}
          </Button>
          <Button onClick={handleReset} className="min-w-[110px] bg-zinc-600 hover:bg-zinc-500">
            {t('actions.reset')}
          </Button>
          <Button onClick={handleCopy} className="min-w-[120px] bg-zinc-900 hover:bg-zinc-800">
            {copyLabel}
          </Button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <Text variant="d2" color="basic-2">
            {t('results.title')}
          </Text>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Text variant="c1" color="basic-5">
                {t('results.availableTotal')}
              </Text>
              <Text variant="t3">{formatNumber(results.availableTotal, lng)}</Text>
            </div>
            <div className="space-y-1">
              <Text variant="c1" color="basic-5">
                {t('results.usedTotal')}
              </Text>
              <Text variant="t3">{formatNumber(results.usedTotal, lng)}</Text>
            </div>
            <div className="space-y-1">
              <Text variant="c1" color="basic-5">
                {t('results.remaining')}
              </Text>
              <Text variant="t3">{formatNumber(results.remaining, lng)}</Text>
            </div>
            <div className="space-y-1">
              <Text variant="c1" color="basic-5">
                {t('results.remainingAfterPlan')}
              </Text>
              <Text variant="t3">{formatNumber(results.remainingAfterPlan, lng)}</Text>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Text variant="c1" color="basic-5">
            {t('results.usedPercent')}
          </Text>
          <Text variant="t3">{formatNumber(results.usedPercent, lng)}%</Text>
        </div>

        {hasInvalidTotal && (
          <Text variant="c1" color="basic-6" className="text-red-500">
            {t('warnings.invalidTotal')}
          </Text>
        )}
        {isOverused && (
          <Text variant="c1" color="basic-6" className="text-red-500">
            {t('warnings.overUsed')}
          </Text>
        )}
        {!isOverused && isNegativeRemaining && (
          <Text variant="c1" color="basic-6" className="text-red-500">
            {t('warnings.negativeRemaining')}
          </Text>
        )}
      </section>
    </div>
  );
}
