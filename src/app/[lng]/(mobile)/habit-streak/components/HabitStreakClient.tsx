'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_PANEL_SOFT,
  SERVICE_PAGE_SURFACE,
  SERVICE_CARD_INTERACTIVE,
} from '@components/complex/Service/interactiveStyles';

const STORAGE_KEY = 'habit-streak-tool';

type Habit = {
  id: string;
  name: string;
  createdAt: string;
  lastDoneAt: string | null;
  streak: number;
  bestStreak: number;
};

const getDateKey = (date: Date) =>
  new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

const getTodayKey = () => getDateKey(new Date());

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getYesterdayKey = () => getDateKey(addDays(new Date(), -1));

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `habit-${Date.now()}-${Math.random().toString(16).slice(2)}`;

type HabitStreakClientProps = {
  lng: Language;
};

const sampleHabits: Habit[] = [
  {
    id: 'sample-1',
    name: '물 2L 마시기',
    createdAt: getTodayKey(),
    lastDoneAt: null,
    streak: 0,
    bestStreak: 0,
  },
  {
    id: 'sample-2',
    name: '10분 스트레칭',
    createdAt: getTodayKey(),
    lastDoneAt: null,
    streak: 0,
    bestStreak: 0,
  },
];

export default function HabitStreakClient({ lng }: HabitStreakClientProps) {
  const { t } = useTranslation(lng, 'habit-streak');
  const [name, setName] = useState('');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Habit[];
      setHabits(parsed);
    } catch {
      // ignore malformed storage
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  const stats = useMemo(() => {
    const total = habits.length;
    const totalStreak = habits.reduce((sum, habit) => sum + habit.streak, 0);
    const bestStreak = habits.reduce((max, habit) => Math.max(max, habit.bestStreak), 0);
    const doneToday = habits.filter((habit) => habit.lastDoneAt === getTodayKey()).length;
    return { total, totalStreak, bestStreak, doneToday };
  }, [habits]);

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setHabits((prev) => [
      {
        id: createId(),
        name: trimmed,
        createdAt: getTodayKey(),
        lastDoneAt: null,
        streak: 0,
        bestStreak: 0,
      },
      ...prev,
    ]);
    setName('');
  };

  const handleMarkToday = (id: string) => {
    const today = getTodayKey();
    const yesterday = getYesterdayKey();
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id) return habit;
        if (habit.lastDoneAt === today) return habit;
        const nextStreak = habit.lastDoneAt === yesterday ? habit.streak + 1 : 1;
        return {
          ...habit,
          lastDoneAt: today,
          streak: nextStreak,
          bestStreak: Math.max(habit.bestStreak, nextStreak),
        };
      }),
    );
  };

  const handleReset = (id: string) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id
          ? {
              ...habit,
              lastDoneAt: null,
              streak: 0,
            }
          : habit,
      ),
    );
  };

  const handleRemove = (id: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  };

  const handleSample = () => {
    setHabits(sampleHabits);
  };

  const handleClear = () => {
    setHabits([]);
  };

  const handleCopy = async () => {
    if (!navigator.clipboard) return;
    const streakLabel = t('labels.streak');
    const bestLabel = t('labels.best');
    const lines = habits.map(
      (habit) => `${habit.name}: ${streakLabel} ${habit.streak} / ${bestLabel} ${habit.bestStreak}`,
    );
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard failures
    }
  };

  return (
    <div className={cn(SERVICE_PAGE_SURFACE, 'space-y-4')}>
      <div className="space-y-2">
        <Text className="t-d-2 text-gray-600 dark:text-gray-300">{t('helper')}</Text>
        <div className="flex flex-col gap-2 md:flex-row">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('placeholder')}
          />
          <Button className="md:w-[120px]" onClick={handleAdd}>
            {t('buttons.add')}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="bg-zinc-600 hover:bg-zinc-500" onClick={handleSample}>
            {t('buttons.sample')}
          </Button>
          <Button className="bg-zinc-500 hover:bg-zinc-400" onClick={handleClear}>
            {t('buttons.clear')}
          </Button>
          <Button className="bg-zinc-700 hover:bg-zinc-600" onClick={handleCopy}>
            {copied ? t('buttons.copied') : t('buttons.copy')}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          { label: t('stats.total'), value: stats.total },
          { label: t('stats.doneToday'), value: stats.doneToday },
          { label: t('stats.totalStreak'), value: stats.totalStreak },
          { label: t('stats.bestStreak'), value: stats.bestStreak },
        ].map((stat) => (
          <div key={stat.label} className={cn(SERVICE_PANEL_SOFT, 'px-4 py-3')}>
            <Text className="t-d-3 text-gray-500 dark:text-gray-400">{stat.label}</Text>
            <Text className="t-d-1 text-gray-900 dark:text-gray-100">{stat.value}</Text>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className={cn(SERVICE_PANEL_SOFT, 'px-4 py-6 text-center')}>
            <Text className="t-d-2 text-gray-500 dark:text-gray-400">{t('empty')}</Text>
          </div>
        ) : (
          habits.map((habit) => {
            const isDoneToday = habit.lastDoneAt === getTodayKey();
            return (
              <div
                key={habit.id}
                className={cn(
                  SERVICE_PANEL_SOFT,
                  SERVICE_CARD_INTERACTIVE,
                  'flex flex-col gap-3 px-4 py-4',
                )}
              >
                <div className="flex flex-col gap-1">
                  <Text className="t-d-1 text-gray-900 dark:text-gray-100">{habit.name}</Text>
                  <Text className="t-d-3 text-gray-500 dark:text-gray-400">
                    {t('labels.createdAt')}: {habit.createdAt}
                  </Text>
                  <Text className="t-d-3 text-gray-500 dark:text-gray-400">
                    {t('labels.lastDone')}: {habit.lastDoneAt ?? t('labels.none')}
                  </Text>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Text className="t-d-2 text-gray-700 dark:text-gray-200">
                    {t('labels.streak')}: {habit.streak}
                  </Text>
                  <Text className="t-d-2 text-gray-700 dark:text-gray-200">
                    {t('labels.best')}: {habit.bestStreak}
                  </Text>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    className="bg-point-2 hover:bg-point-1"
                    onClick={() => handleMarkToday(habit.id)}
                    disabled={isDoneToday}
                  >
                    {isDoneToday ? t('buttons.done') : t('buttons.markToday')}
                  </Button>
                  <Button
                    className="bg-zinc-600 hover:bg-zinc-500"
                    onClick={() => handleReset(habit.id)}
                  >
                    {t('buttons.reset')}
                  </Button>
                  <Button
                    className="bg-red-500 hover:bg-red-400"
                    onClick={() => handleRemove(habit.id)}
                  >
                    {t('buttons.remove')}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
