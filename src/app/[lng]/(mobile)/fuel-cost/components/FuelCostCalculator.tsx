'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface FuelCostCalculatorProps {
  lng: Language;
}

function FuelCostCalculator({ lng }: FuelCostCalculatorProps) {
  const { t } = useTranslation(lng, 'fuel-cost');
  const [distance, setDistance] = useState('');
  const [efficiency, setEfficiency] = useState('');
  const [fuelPrice, setFuelPrice] = useState('');
  const formatter = useMemo(
    () => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }),
    [],
  );

  const summary = useMemo(() => {
    const distanceValue = Number(distance);
    const efficiencyValue = Number(efficiency);
    const fuelPriceValue = Number(fuelPrice);

    if (!Number.isFinite(distanceValue) || distanceValue <= 0) return null;
    if (!Number.isFinite(efficiencyValue) || efficiencyValue <= 0) return null;
    if (!Number.isFinite(fuelPriceValue) || fuelPriceValue <= 0) return null;

    const fuelUsed = distanceValue / efficiencyValue;
    const totalCost = fuelUsed * fuelPriceValue;
    const costPer100 = (100 / efficiencyValue) * fuelPriceValue;

    return {
      fuelUsed,
      totalCost,
      costPer100,
    };
  }, [distance, efficiency, fuelPrice]);

  const handleReset = () => {
    setDistance('');
    setEfficiency('');
    setFuelPrice('');
  };

  return (
    <div className="space-y-4">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text className="text-sm text-gray-600 dark:text-gray-300">{t('helper')}</Text>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-1" htmlFor="fuel-distance">
            <Text className="text-sm text-gray-700 dark:text-gray-200">{t('label.distance')}</Text>
            <Input
              id="fuel-distance"
              type="number"
              min="0"
              inputMode="decimal"
              placeholder={t('placeholder.distance')}
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
            />
          </label>
          <label className="space-y-1" htmlFor="fuel-efficiency">
            <Text className="text-sm text-gray-700 dark:text-gray-200">
              {t('label.efficiency')}
            </Text>
            <Input
              id="fuel-efficiency"
              type="number"
              min="0"
              inputMode="decimal"
              placeholder={t('placeholder.efficiency')}
              value={efficiency}
              onChange={(event) => setEfficiency(event.target.value)}
            />
          </label>
          <label className="space-y-1" htmlFor="fuel-price">
            <Text className="text-sm text-gray-700 dark:text-gray-200">{t('label.fuelPrice')}</Text>
            <Input
              id="fuel-price"
              type="number"
              min="0"
              inputMode="decimal"
              placeholder={t('placeholder.fuelPrice')}
              value={fuelPrice}
              onChange={(event) => setFuelPrice(event.target.value)}
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" className="px-3 text-sm" onClick={handleReset}>
            {t('button.reset')}
          </Button>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-3 p-4')}>
        <Text className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {t('result.title')}
        </Text>
        {!summary ? (
          <Text className="text-sm text-gray-500 dark:text-gray-400">{t('result.empty')}</Text>
        ) : (
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
            <Text>
              {t('result.fuelUsed')}: {summary.fuelUsed.toFixed(2)} L
            </Text>
            <Text>
              {t('result.totalCost')}: {formatter.format(summary.totalCost)}
            </Text>
            <Text>
              {t('result.costPer100')}: {formatter.format(summary.costPer100)}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">{t('result.note')}</Text>
          </div>
        )}
      </div>
    </div>
  );
}

export default FuelCostCalculator;
