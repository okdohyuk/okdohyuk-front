'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Textarea } from '@components/basic/Textarea';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const MAX_DAYS = 7;
const DEFAULT_DAYS = 3;

const parseTasks = (value: string) =>
  value
    .split(/\n|,/)
    .map((task) => task.trim())
    .filter(Boolean);

const shuffle = (items: string[]) => [...items].sort(() => Math.random() - 0.5);

const pickDays = (total: number, count: number) => {
  const indices = shuffle(Array.from({ length: total }, (_, index) => index));
  return indices.slice(0, count).sort((a, b) => a - b);
};

type RoutineDay = {
  label: string;
  tasks: string[];
  isRest: boolean;
};

type CleaningRoutineClientProps = {
  lng: Language;
};

export default function CleaningRoutineClient({ lng }: CleaningRoutineClientProps) {
  const { t } = useTranslation(lng, 'cleaning-routine');
  const [taskInput, setTaskInput] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState(DEFAULT_DAYS);
  const [plan, setPlan] = useState<RoutineDay[]>([]);

  const taskList = useMemo(() => parseTasks(taskInput), [taskInput]);
  const dayNames = t('dayNames', { returnObjects: true }) as string[];

  const canGenerate = taskList.length > 0;

  const generatePlan = () => {
    if (!canGenerate) return;

    const selectedDays = pickDays(dayNames.length, daysPerWeek);
    const shuffledTasks = shuffle(taskList);

    const buckets: string[][] = Array.from({ length: selectedDays.length }, () => []);
    shuffledTasks.forEach((task, index) => {
      buckets[index % buckets.length].push(task);
    });

    let bucketIndex = 0;
    const nextPlan = dayNames.map((label, index) => {
      if (!selectedDays.includes(index)) {
        return { label, tasks: [], isRest: true };
      }
      const tasks = buckets[bucketIndex] ?? [];
      bucketIndex += 1;
      return { label, tasks, isRest: false };
    });

    setPlan(nextPlan);
  };

  const handleDaysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) {
      setDaysPerWeek(DEFAULT_DAYS);
      return;
    }
    const clamped = Math.min(Math.max(value, 1), MAX_DAYS);
    setDaysPerWeek(clamped);
  };

  const handleReset = () => {
    setTaskInput('');
    setDaysPerWeek(DEFAULT_DAYS);
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
            value={taskInput}
            onChange={(event) => setTaskInput(event.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">{t('daysLabel')}</p>
            <Input
              type="number"
              min={1}
              max={MAX_DAYS}
              value={daysPerWeek}
              onChange={handleDaysChange}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">{t('tipsTitle')}</p>
            <p className="text-xs text-gray-500">{t('tips')}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={generatePlan} disabled={!canGenerate} className="px-4">
            {t('generate')}
          </Button>
          <Button type="button" onClick={generatePlan} disabled={!canGenerate} className="px-4">
            {t('shuffle')}
          </Button>
          <Button type="button" onClick={handleReset} className="px-4 bg-gray-200 text-gray-700">
            {t('reset')}
          </Button>
        </div>
      </section>

      {plan.length ? (
        <section className="space-y-3">
          {plan.map((day) => (
            <article key={day.label} className={`${SERVICE_PANEL_SOFT} space-y-2 p-4`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">{day.label}</h3>
                <span className="text-xs text-gray-500">{t('planTitle')}</span>
              </div>
              {day.isRest ? (
                <p className="text-sm text-gray-500">{t('restLabel')}</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {day.tasks.map((task) => (
                    <li key={task} className="flex items-center justify-between">
                      <span className="text-gray-500">{t('taskLabel')}</span>
                      <span className="font-medium text-gray-800">{task}</span>
                    </li>
                  ))}
                </ul>
              )}
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
