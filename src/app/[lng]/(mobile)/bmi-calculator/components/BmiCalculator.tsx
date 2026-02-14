'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

type BmiCalculatorProps = {
  lng: Language;
};

type CategoryKey = 'underweight' | 'normal' | 'overweight' | 'obese';

const getCategoryKey = (value: number): CategoryKey => {
  if (value < 18.5) return 'underweight';
  if (value < 25) return 'normal';
  if (value < 30) return 'overweight';
  return 'obese';
};

export default function BmiCalculator({ lng }: BmiCalculatorProps) {
  const { t } = useTranslation(lng, 'bmi-calculator');

  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('65');

  const result = useMemo(() => {
    const heightValue = Number(height);
    const weightValue = Number(weight);

    if (Number.isNaN(heightValue) || Number.isNaN(weightValue)) return null;
    if (heightValue <= 0 || weightValue <= 0) return null;

    const heightMeter = heightValue / 100;
    const bmiValue = weightValue / (heightMeter * heightMeter);
    const roundedValue = Math.round(bmiValue * 10) / 10;
    const categoryKey = getCategoryKey(roundedValue);

    return {
      value: roundedValue,
      categoryKey,
    };
  }, [height, weight]);

  const handleReset = () => {
    setHeight('170');
    setWeight('65');
  };

  return (
    <div className="space-y-4">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <Text variant="d2" color="basic-3">
          {t('helper')}
        </Text>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Text variant="d3" color="basic-4">
              {t('label.height')}
            </Text>
            <Input
              type="number"
              min={1}
              inputMode="decimal"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
              placeholder={t('placeholder.height')}
            />
          </div>
          <div className="space-y-2">
            <Text variant="d3" color="basic-4">
              {t('label.weight')}
            </Text>
            <Input
              type="number"
              min={1}
              inputMode="decimal"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder={t('placeholder.weight')}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleReset}>
            {t('button.reset')}
          </Button>
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
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Text variant="d3" color="basic-4">
                  {t('result.valueLabel')}
                </Text>
                <Text variant="t3" color="basic-2">
                  {t('result.value', { value: result.value })}
                </Text>
              </div>
              <div className="space-y-1">
                <Text variant="d3" color="basic-4">
                  {t('result.categoryLabel')}
                </Text>
                <Text variant="d2" color="basic-2">
                  {t(`result.category.${result.categoryKey}.label`)}
                </Text>
                <Text variant="c1" color="basic-4">
                  {t(`result.category.${result.categoryKey}.range`)}
                </Text>
              </div>
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
