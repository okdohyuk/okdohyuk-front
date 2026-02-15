'use client';

import React, { useMemo, useState } from 'react';
import { Text } from '@components/basic/Text';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatNumber = (value: number, maximumFractionDigits = 2) =>
  new Intl.NumberFormat('ko-KR', { maximumFractionDigits }).format(value);

type Preset = {
  label: string;
  watts: number;
  hours: number;
};

export default function PowerUsageCalculatorClient({ lng }: { lng: Language }) {
  const { t } = useTranslation(lng, 'power-usage-calculator');
  const [watts, setWatts] = useState('60');
  const [hours, setHours] = useState('6');
  const [price, setPrice] = useState('150');
  const [days, setDays] = useState('30');
  const [copied, setCopied] = useState(false);

  const presets = useMemo<Preset[]>(
    () => [
      { label: t('presetLaptop'), watts: 60, hours: 6 },
      { label: t('presetLed'), watts: 10, hours: 5 },
      { label: t('presetHeater'), watts: 1500, hours: 3 },
    ],
    [t],
  );

  const numericWatts = toNumber(watts);
  const numericHours = toNumber(hours);
  const numericPrice = toNumber(price);
  const numericDays = toNumber(days);

  const hasValidInput = numericWatts > 0 && numericHours > 0 && numericPrice > 0 && numericDays > 0;

  const { dailyKwh, monthlyKwh, monthlyCost, yearlyCost } = useMemo(() => {
    if (!hasValidInput) {
      return {
        dailyKwh: 0,
        monthlyKwh: 0,
        monthlyCost: 0,
        yearlyCost: 0,
      };
    }

    const daily = (numericWatts * numericHours) / 1000;
    const monthly = daily * numericDays;
    const monthlyPrice = monthly * numericPrice;
    const yearlyPrice = monthlyPrice * 12;

    return {
      dailyKwh: daily,
      monthlyKwh: monthly,
      monthlyCost: monthlyPrice,
      yearlyCost: yearlyPrice,
    };
  }, [hasValidInput, numericWatts, numericHours, numericDays, numericPrice]);

  const handleCopy = async () => {
    if (!hasValidInput) return;

    const summary = [
      `${t('resultDailyEnergy')}: ${formatNumber(dailyKwh)} kWh`,
      `${t('resultMonthlyEnergy')}: ${formatNumber(monthlyKwh)} kWh`,
      `${t('resultMonthlyCost')}: ${formatNumber(monthlyCost)} ${t('currencyUnit')}`,
      `${t('resultYearlyCost')}: ${formatNumber(yearlyCost)} ${t('currencyUnit')}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setWatts('');
    setHours('');
    setPrice('');
    setDays('30');
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        <div className="space-y-2">
          <Text variant="d2" color="basic-3">
            {t('wattsLabel')}
          </Text>
          <Input
            type="number"
            inputMode="decimal"
            placeholder={t('wattsPlaceholder')}
            value={watts}
            onChange={(event) => setWatts(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Text variant="d2" color="basic-3">
            {t('hoursLabel')}
          </Text>
          <Input
            type="number"
            inputMode="decimal"
            placeholder={t('hoursPlaceholder')}
            value={hours}
            onChange={(event) => setHours(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Text variant="d2" color="basic-3">
            {t('daysLabel')}
          </Text>
          <Input
            type="number"
            inputMode="decimal"
            placeholder={t('daysPlaceholder')}
            value={days}
            onChange={(event) => setDays(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Text variant="d2" color="basic-3">
            {t('priceLabel')}
          </Text>
          <Input
            type="number"
            inputMode="decimal"
            placeholder={t('pricePlaceholder')}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              className="px-2 text-sm"
              onClick={() => {
                setWatts(String(preset.watts));
                setHours(String(preset.hours));
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="px-2 text-sm"
            onClick={handleCopy}
            disabled={!hasValidInput}
          >
            {copied ? t('copied') : t('copyResult')}
          </Button>
          <Button
            type="button"
            className="px-2 text-sm bg-gray-400 hover:bg-gray-500"
            onClick={handleReset}
          >
            {t('reset')}
          </Button>
        </div>
        {!hasValidInput && (
          <Text variant="d3" color="basic-5">
            {t('validationHint')}
          </Text>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <Text variant="d2" color="basic-2">
          {t('resultTitle')}
        </Text>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Text variant="d3" color="basic-4">
              {t('resultDailyEnergy')}
            </Text>
            <Text variant="d2" color="basic-1">
              {formatNumber(dailyKwh)} kWh
            </Text>
          </div>
          <div className="flex items-center justify-between">
            <Text variant="d3" color="basic-4">
              {t('resultMonthlyEnergy')}
            </Text>
            <Text variant="d2" color="basic-1">
              {formatNumber(monthlyKwh)} kWh
            </Text>
          </div>
          <div className="flex items-center justify-between">
            <Text variant="d3" color="basic-4">
              {t('resultMonthlyCost')}
            </Text>
            <Text variant="d2" color="basic-1">
              {formatNumber(monthlyCost)} {t('currencyUnit')}
            </Text>
          </div>
          <div className="flex items-center justify-between">
            <Text variant="d3" color="basic-4">
              {t('resultYearlyCost')}
            </Text>
            <Text variant="d2" color="basic-1">
              {formatNumber(yearlyCost)} {t('currencyUnit')}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
