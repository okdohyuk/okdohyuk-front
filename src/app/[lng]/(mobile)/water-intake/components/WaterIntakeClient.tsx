'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@components/basic/Input';
import Select from '@components/complex/Select';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface WaterIntakeClientProps {
  lng: Language;
}

const ACTIVITY_BONUS: Record<string, number> = {
  low: 0,
  moderate: 0.35,
  high: 0.7,
};

const CLIMATE_BONUS: Record<string, number> = {
  normal: 0,
  hot: 0.3,
};

export default function WaterIntakeClient({ lng }: WaterIntakeClientProps) {
  const { t } = useTranslation(lng, 'water-intake');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('moderate');
  const [climate, setClimate] = useState('normal');
  const [cupSize, setCupSize] = useState('250');

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(lng, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
      }),
    [lng],
  );

  const calculations = useMemo(() => {
    const weightValue = Number(weight);
    const cupSizeValue = Number(cupSize) || 0;
    const base = weightValue > 0 ? weightValue * 0.033 : 0;
    const activityBonus = ACTIVITY_BONUS[activity] ?? 0;
    const climateBonus = CLIMATE_BONUS[climate] ?? 0;
    const total = Math.max(base + activityBonus + climateBonus, 0);
    const cups = cupSizeValue > 0 ? Math.round((total * 1000) / cupSizeValue) : 0;

    return {
      weightValue,
      cupSizeValue,
      base,
      activityBonus,
      climateBonus,
      total,
      cups,
    };
  }, [weight, cupSize, activity, climate]);

  const tips = t('tips.items', { returnObjects: true }) as string[];

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div>
          <label htmlFor="weight" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t('label.weight')}
          </label>
          <Input
            id="weight"
            type="number"
            inputMode="decimal"
            placeholder={t('placeholder.weight')}
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="activity"
              className="text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              {t('label.activity')}
            </label>
            <Select className="w-full" value={activity} onChange={setActivity}>
              <option value="low">{t('activity.low')}</option>
              <option value="moderate">{t('activity.moderate')}</option>
              <option value="high">{t('activity.high')}</option>
            </Select>
          </div>
          <div>
            <label
              htmlFor="climate"
              className="text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              {t('label.climate')}
            </label>
            <Select className="w-full" value={climate} onChange={setClimate}>
              <option value="normal">{t('climate.normal')}</option>
              <option value="hot">{t('climate.hot')}</option>
            </Select>
          </div>
        </div>

        <div>
          <label
            htmlFor="cup-size"
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            {t('label.cupSize')}
          </label>
          <Input
            id="cup-size"
            type="number"
            inputMode="numeric"
            placeholder={t('placeholder.cupSize')}
            value={cupSize}
            onChange={(event) => setCupSize(event.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {t('result.title')}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200/70 p-3 dark:border-gray-700/70">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('result.total')}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatter.format(calculations.total)} {t('unit.liter')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('result.cups', { count: calculations.cups })}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200/70 p-3 dark:border-gray-700/70">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('result.base')}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatter.format(calculations.base)} {t('unit.liter')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('result.baseNote')}</p>
          </div>
          <div className="rounded-2xl border border-gray-200/70 p-3 dark:border-gray-700/70">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('result.activity')}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              +{formatter.format(calculations.activityBonus)} {t('unit.liter')}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200/70 p-3 dark:border-gray-700/70">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('result.climate')}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              +{formatter.format(calculations.climateBonus)} {t('unit.liter')}
            </p>
          </div>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-4')}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {t('tips.title')}
        </h3>
        <ul className="list-disc space-y-1 pl-4 text-sm text-gray-600 dark:text-gray-300">
          {tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
