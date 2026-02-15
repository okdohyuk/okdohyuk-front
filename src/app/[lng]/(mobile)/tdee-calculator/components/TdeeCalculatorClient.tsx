'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface TdeeCalculatorClientProps {
  lng: Language;
}

type ActivityKey = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

type FormState = {
  sex: 'male' | 'female';
  age: string;
  height: string;
  weight: string;
  activity: ActivityKey;
};

const DEFAULT_FORM: FormState = {
  sex: 'male',
  age: '',
  height: '',
  weight: '',
  activity: 'moderate',
};

const ACTIVITY_FACTORS: Record<ActivityKey, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

const toNumber = (value: string, min: number, max: number) => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return null;
  if (parsed < min || parsed > max) return null;
  return parsed;
};

export default function TdeeCalculatorClient({ lng }: TdeeCalculatorClientProps) {
  const { t } = useTranslation(lng, 'tdee-calculator');
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const activityOptions = useMemo(
    () =>
      (Object.keys(ACTIVITY_FACTORS) as ActivityKey[]).map((key) => ({
        key,
        factor: ACTIVITY_FACTORS[key],
        label: t(`activity.${key}`),
        description: t(`activity.${key}Desc`),
      })),
    [t],
  );

  const { bmr, tdee, factor, isReady } = useMemo(() => {
    const age = toNumber(form.age, 10, 120);
    const height = toNumber(form.height, 120, 220);
    const weight = toNumber(form.weight, 30, 250);
    if (!age || !height || !weight) {
      return { bmr: null, tdee: null, factor: null, isReady: false };
    }
    const base = 10 * weight + 6.25 * height - 5 * age;
    const bmrValue = form.sex === 'male' ? base + 5 : base - 161;
    const activityFactor = ACTIVITY_FACTORS[form.activity];
    return {
      bmr: Math.round(bmrValue),
      tdee: Math.round(bmrValue * activityFactor),
      factor: activityFactor,
      isReady: true,
    };
  }, [form]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFillExample = () => {
    setForm({
      sex: 'female',
      age: '29',
      height: '165',
      weight: '57',
      activity: 'light',
    });
  };

  const handleReset = () => {
    setForm(DEFAULT_FORM);
  };

  const selectedActivity = activityOptions.find((option) => option.key === form.activity);

  return (
    <div className="space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Text className="text-sm font-semibold" color="basic-4">
              {t('label.sex')}
            </Text>
            <Select value={form.sex} onValueChange={(value) => handleChange('sex', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t('sex.male')}</SelectItem>
                <SelectItem value="female">{t('sex.female')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Text className="text-sm font-semibold" color="basic-4">
              {t('label.age')}
            </Text>
            <Input
              inputMode="numeric"
              placeholder={t('placeholder.age')}
              value={form.age}
              onChange={(event) => handleChange('age', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text className="text-sm font-semibold" color="basic-4">
              {t('label.height')}
            </Text>
            <Input
              inputMode="decimal"
              placeholder={t('placeholder.height')}
              value={form.height}
              onChange={(event) => handleChange('height', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text className="text-sm font-semibold" color="basic-4">
              {t('label.weight')}
            </Text>
            <Input
              inputMode="decimal"
              placeholder={t('placeholder.weight')}
              value={form.weight}
              onChange={(event) => handleChange('weight', event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Text className="text-sm font-semibold" color="basic-4">
            {t('label.activity')}
          </Text>
          <Select
            value={form.activity}
            onValueChange={(value) => handleChange('activity', value as ActivityKey)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {activityOptions.map((option) => (
                <SelectItem key={option.key} value={option.key}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Text className="text-xs" color="basic-5">
            {selectedActivity?.description}
          </Text>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleFillExample} className="px-4 py-2 text-xs">
            {t('button.fillExample')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            className="px-4 py-2 text-xs"
          >
            {t('button.reset')}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {[
          { key: 'bmr', label: t('result.bmr'), value: bmr },
          { key: 'tdee', label: t('result.tdee'), value: tdee },
        ].map((item) => (
          <div
            key={item.key}
            className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-2 p-4')}
          >
            <Text className="text-sm font-semibold" color="basic-4">
              {item.label}
            </Text>
            <div className="flex items-end gap-2">
              <Text asChild variant="t2" color="basic-1">
                <span>{item.value ? item.value.toLocaleString() : t('empty')}</span>
              </Text>
              {item.value ? (
                <Text className="text-xs" color="basic-5">
                  {t('result.kcal')}
                </Text>
              ) : null}
            </div>
            {item.key === 'tdee' && isReady && factor ? (
              <Text className="text-xs" color="basic-6">
                {t('result.summary', { factor: factor.toFixed(3) })}
              </Text>
            ) : null}
          </div>
        ))}
      </div>

      <Text className="text-xs" color="basic-5">
        {t('notice')}
      </Text>
    </div>
  );
}
