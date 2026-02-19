'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Copy, RefreshCcw } from 'lucide-react';

interface BmiCalculatorProps {
  lng: Language;
}

type BmiCategory = {
  key: 'underweight' | 'normal' | 'overweight' | 'obese';
  min: number;
  max: number | null;
};

const BMI_CATEGORIES: BmiCategory[] = [
  { key: 'underweight', min: 0, max: 18.4 },
  { key: 'normal', min: 18.5, max: 24.9 },
  { key: 'overweight', min: 25, max: 29.9 },
  { key: 'obese', min: 30, max: null },
];

export default function BmiCalculator({ lng }: BmiCalculatorProps) {
  const { t } = useTranslation(lng, 'bmi-calculator');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const heightCm = Number(height);
    const weightKg = Number(weight);

    if (!height || !weight || Number.isNaN(heightCm) || Number.isNaN(weightKg)) {
      return null;
    }

    if (heightCm <= 0 || weightKg <= 0) {
      return { bmi: null, category: null, valid: false };
    }

    const heightM = heightCm / 100;
    const bmiValue = weightKg / (heightM * heightM);
    const category = BMI_CATEGORIES.find((item) => {
      if (item.max === null) return bmiValue >= item.min;
      return bmiValue >= item.min && bmiValue <= item.max;
    });

    return {
      bmi: Number(bmiValue.toFixed(1)),
      category: category?.key ?? null,
      valid: true,
    };
  }, [height, weight]);

  const handleReset = () => {
    setHeight('');
    setWeight('');
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!result?.bmi) return;
    const categoryLabel = result.category ? t(`category.${result.category}`) : '';
    const message = `${t('result.bmi')}: ${result.bmi} (${categoryLabel})`;

    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setCopied(false);
    }
  };

  const categoryClass = {
    underweight: 'text-sky-600 dark:text-sky-400',
    normal: 'text-emerald-600 dark:text-emerald-400',
    overweight: 'text-amber-600 dark:text-amber-400',
    obese: 'text-rose-600 dark:text-rose-400',
  } as const;

  return (
    <div className="w-full space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <label
            htmlFor="height-input"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.height')}
          </label>
          <Input
            id="height-input"
            type="number"
            min="0"
            step="0.1"
            placeholder={t('placeholder.height')}
            value={height}
            onChange={(event) => setHeight(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="weight-input"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.weight')}
          </label>
          <Input
            id="weight-input"
            type="number"
            min="0"
            step="0.1"
            placeholder={t('placeholder.weight')}
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
          />
        </div>
        <Text variant="d3" color="basic-5" className="block">
          {t('helper')}
        </Text>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleReset} className="flex items-center gap-2 px-3 py-1 text-sm">
            <RefreshCcw size={16} />
            {t('button.reset')}
          </Button>
          <Button
            onClick={handleCopy}
            disabled={!result?.bmi}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
          >
            <Copy size={16} />
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
      </section>

      <section
        className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-3 p-4 text-center')}
      >
        <Text variant="t3" className="block">
          {t('result.title')}
        </Text>
        {!result && (
          <Text variant="d2" color="basic-5" className="block">
            {t('result.empty')}
          </Text>
        )}
        {result && !result.valid && (
          <Text variant="d2" color="basic-5" className="block">
            {t('result.invalid')}
          </Text>
        )}
        {result?.valid && result.bmi && (
          <div className="space-y-2">
            <Text variant="t1" className="block">
              {result.bmi}
            </Text>
            {result.category && (
              <Text
                variant="d1"
                className={cn('block font-semibold', categoryClass[result.category])}
              >
                {t(`category.${result.category}`)}
              </Text>
            )}
          </div>
        )}
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text variant="d2" className="block font-semibold">
          {t('range.title')}
        </Text>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          {BMI_CATEGORIES.map((item) => (
            <li key={item.key} className="flex items-center justify-between gap-3">
              <span className={cn('font-medium', categoryClass[item.key])}>
                {t(`category.${item.key}`)}
              </span>
              <span>
                {item.max === null
                  ? t('range.over', { value: item.min })
                  : t('range.between', { min: item.min, max: item.max })}
              </span>
            </li>
          ))}
        </ul>
        <Text variant="c1" color="basic-5" className="block">
          {t('range.note')}
        </Text>
      </section>
    </div>
  );
}
