'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Textarea } from '@components/basic/Textarea';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';

const MAX_DAYS = 14;
const DEFAULT_DAYS = 7;
const DEFAULT_MEALS = ['breakfast', 'lunch', 'dinner'] as const;

const MEAL_KEYS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

type MealKey = (typeof MEAL_KEYS)[number];

type PlanItem = {
  key: MealKey;
  label: string;
  item: string;
};

type PlanDay = {
  label: string;
  meals: PlanItem[];
};

const parseMeals = (value: string) =>
  value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const pickRandom = (items: string[]) => items[Math.floor(Math.random() * items.length)];

type MealPlannerClientProps = {
  lng: Language;
};

export default function MealPlannerClient({ lng }: MealPlannerClientProps) {
  const { t } = useTranslation(lng, 'meal-planner');
  const [mealInput, setMealInput] = useState('');
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [selectedMeals, setSelectedMeals] = useState<MealKey[]>([...DEFAULT_MEALS]);
  const [plan, setPlan] = useState<PlanDay[]>([]);

  const mealLabels = t('mealOptions', { returnObjects: true }) as Record<MealKey, string>;
  const dayNames = t('dayNames', { returnObjects: true }) as string[];
  const dayPrefix = t('dayPrefix');

  const mealList = useMemo(() => parseMeals(mealInput), [mealInput]);
  const canGenerate = mealList.length > 0 && selectedMeals.length > 0;

  const buildPlan = () => {
    if (!canGenerate) return;

    const nextPlan: PlanDay[] = Array.from({ length: days }).map((_, index) => {
      const label = dayNames[index] ?? `${dayPrefix} ${index + 1}`;
      const meals = selectedMeals.map((key) => ({
        key,
        label: mealLabels[key],
        item: pickRandom(mealList),
      }));

      return { label, meals };
    });

    setPlan(nextPlan);
  };

  const toggleMeal = (key: MealKey) => {
    setSelectedMeals((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== key);
      }
      return [...prev, key];
    });
  };

  const handleDaysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) {
      setDays(DEFAULT_DAYS);
      return;
    }

    const clamped = Math.min(Math.max(value, 1), MAX_DAYS);
    setDays(clamped);
  };

  const handleClear = () => {
    setMealInput('');
    setDays(DEFAULT_DAYS);
    setSelectedMeals([...DEFAULT_MEALS]);
    setPlan([]);
  };

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">{t('inputLabel')}</p>
          <Textarea
            className="min-h-[140px] resize-none"
            placeholder={t('inputPlaceholder')}
            value={mealInput}
            onChange={(event) => setMealInput(event.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('daysLabel')}</span>
            <Input type="number" min={1} max={MAX_DAYS} value={days} onChange={handleDaysChange} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">{t('mealsLabel')}</p>
            <div className="flex flex-wrap gap-2">
              {MEAL_KEYS.map((key) => {
                const isSelected = selectedMeals.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleMeal(key)}
                    className={cn(
                      'rounded-full px-3 py-1 text-sm font-medium transition-colors',
                      isSelected
                        ? 'bg-point-2 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                    )}
                  >
                    {mealLabels[key]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500">{t('tips')}</p>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={buildPlan} disabled={!canGenerate} className="px-4">
            {t('generate')}
          </Button>
          <Button type="button" onClick={buildPlan} disabled={!canGenerate} className="px-4">
            {t('shuffle')}
          </Button>
          <Button type="button" onClick={handleClear} className="px-4 bg-gray-200 text-gray-700">
            {t('clear')}
          </Button>
        </div>
      </section>

      {plan.length ? (
        <section className="space-y-3">
          {plan.map((day) => (
            <article key={day.label} className={`${SERVICE_PANEL_SOFT} space-y-3 p-4`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">{day.label}</h3>
                <span className="text-xs text-gray-500">{t('planTitle')}</span>
              </div>
              <ul className="space-y-2 text-sm">
                {day.meals.map((meal) => (
                  <li key={meal.key} className="flex items-center justify-between">
                    <span className="text-gray-500">{meal.label}</span>
                    <span className="font-medium text-gray-800">{meal.item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      ) : (
        <section className={`${SERVICE_PANEL_SOFT} p-4 text-sm text-gray-500`}>
          {t('emptyState')}
        </section>
      )}
    </div>
  );
}
