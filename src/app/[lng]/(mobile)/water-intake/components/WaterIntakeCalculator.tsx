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

interface WaterIntakeCalculatorProps {
  lng: Language;
}

const DEFAULT_ACTIVITY = '0';
const DEFAULT_BOTTLE = '500';

function WaterIntakeCalculator({ lng }: WaterIntakeCalculatorProps) {
  const { t } = useTranslation(lng, 'water-intake');
  const [weight, setWeight] = useState('');
  const [activityMinutes, setActivityMinutes] = useState(DEFAULT_ACTIVITY);
  const [bottleSize, setBottleSize] = useState(DEFAULT_BOTTLE);

  const summary = useMemo(() => {
    const weightValue = Number(weight);
    const activityValue = Number(activityMinutes);
    const bottleValue = Number(bottleSize);

    if (!Number.isFinite(weightValue) || weightValue <= 0) {
      return null;
    }

    const baseLiters = weightValue * 0.033;
    const activityLiters = activityValue > 0 ? (activityValue / 30) * 0.35 : 0;
    const totalLiters = baseLiters + activityLiters;
    const cups = totalLiters / 0.25;
    const bottles = bottleValue > 0 ? (totalLiters * 1000) / bottleValue : 0;

    return {
      totalLiters,
      cups,
      bottles,
    };
  }, [weight, activityMinutes, bottleSize]);

  const handleReset = () => {
    setWeight('');
    setActivityMinutes(DEFAULT_ACTIVITY);
    setBottleSize(DEFAULT_BOTTLE);
  };

  return (
    <div className="space-y-4">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text className="text-sm text-gray-600 dark:text-gray-300">{t('helper')}</Text>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-1" htmlFor="water-weight">
            <Text className="text-sm text-gray-700 dark:text-gray-200">{t('label.weight')}</Text>
            <Input
              id="water-weight"
              type="number"
              min="0"
              inputMode="decimal"
              placeholder={t('placeholder.weight')}
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </label>
          <label className="space-y-1" htmlFor="water-activity">
            <Text className="text-sm text-gray-700 dark:text-gray-200">{t('label.activity')}</Text>
            <Input
              id="water-activity"
              type="number"
              min="0"
              inputMode="numeric"
              placeholder={t('placeholder.activity')}
              value={activityMinutes}
              onChange={(event) => setActivityMinutes(event.target.value)}
            />
          </label>
          <label className="space-y-1" htmlFor="water-bottle">
            <Text className="text-sm text-gray-700 dark:text-gray-200">{t('label.bottle')}</Text>
            <Input
              id="water-bottle"
              type="number"
              min="0"
              inputMode="numeric"
              placeholder={t('placeholder.bottle')}
              value={bottleSize}
              onChange={(event) => setBottleSize(event.target.value)}
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
              {t('result.liters')}: {summary.totalLiters.toFixed(2)} L
            </Text>
            <Text>
              {t('result.cups')}: {summary.cups.toFixed(1)}
            </Text>
            <Text>
              {t('result.bottles', { size: bottleSize })}: {summary.bottles.toFixed(1)}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">{t('result.note')}</Text>
          </div>
        )}
      </div>
    </div>
  );
}

export default WaterIntakeCalculator;
