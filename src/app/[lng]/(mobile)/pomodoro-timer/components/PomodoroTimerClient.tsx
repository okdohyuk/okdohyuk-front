'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

type PomodoroTimerClientProps = {
  lng: Language;
};

type Mode = 'focus' | 'break';

const formatTime = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainSeconds = safeSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainSeconds.toString().padStart(2, '0')}`;
};

const clampNumber = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
};

const parseMinutes = (value: string, fallback: number) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return parsed;
};

const PRESETS = [
  { label: '25 / 5', focus: 25, rest: 5 },
  { label: '50 / 10', focus: 50, rest: 10 },
  { label: '15 / 3', focus: 15, rest: 3 },
];

export default function PomodoroTimerClient({ lng }: PomodoroTimerClientProps) {
  const { t } = useTranslation(lng, 'pomodoro-timer');
  const [mode, setMode] = useState<Mode>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [goalSessions, setGoalSessions] = useState(4);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(focusMinutes * 60);

  const totalSeconds = mode === 'focus' ? focusMinutes * 60 : breakMinutes * 60;
  const progress = useMemo(() => {
    if (totalSeconds === 0) return 0;
    return Math.min(100, Math.max(0, ((totalSeconds - secondsLeft) / totalSeconds) * 100));
  }, [secondsLeft, totalSeconds]);

  useEffect(() => {
    if (!isRunning) {
      setSecondsLeft(mode === 'focus' ? focusMinutes * 60 : breakMinutes * 60);
    }
  }, [mode, focusMinutes, breakMinutes, isRunning]);

  useEffect(() => {
    if (!isRunning) return undefined;
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft > 0) return;

    if (mode === 'focus') {
      setMode('break');
      setSecondsLeft(breakMinutes * 60);
      return;
    }

    setMode('focus');
    setSecondsLeft(focusMinutes * 60);
    setCompletedSessions((prev) => {
      const next = prev + 1;
      if (goalSessions > 0 && next >= goalSessions) {
        setIsRunning(false);
      }
      return next;
    });
  }, [secondsLeft, isRunning, mode, focusMinutes, breakMinutes, goalSessions]);

  const handleToggle = () => setIsRunning((prev) => !prev);

  const handleReset = () => {
    setIsRunning(false);
    setMode('focus');
    setSecondsLeft(focusMinutes * 60);
    setCompletedSessions(0);
  };

  const handleSkip = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      setMode('break');
      setSecondsLeft(breakMinutes * 60);
      return;
    }
    setMode('focus');
    setSecondsLeft(focusMinutes * 60);
    setCompletedSessions((prev) => prev + 1);
  };

  const applyPreset = (focus: number, rest: number) => {
    setFocusMinutes(focus);
    setBreakMinutes(rest);
    setIsRunning(false);
    setMode('focus');
    setSecondsLeft(focus * 60);
    setCompletedSessions(0);
  };

  return (
    <div className="space-y-5">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-5')}>
        <div className="flex items-center justify-between">
          <Text variant="d1" className="font-semibold">
            {t(`mode.${mode}`)}
          </Text>
          <Text variant="d2" color="basic-4">
            {t('sessionProgress', { completed: completedSessions, goal: goalSessions })}
          </Text>
        </div>
        <div className="flex flex-col items-center space-y-3">
          <div className="text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
            {formatTime(secondsLeft)}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200/80 dark:bg-zinc-700/60">
            <div
              className="h-full rounded-full bg-point-2 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <Text variant="c1" color="basic-5">
            {t('progressHint')}
          </Text>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={handleToggle}>{isRunning ? t('pause') : t('start')}</Button>
          <Button onClick={handleReset} className="bg-zinc-600 hover:bg-zinc-500">
            {t('reset')}
          </Button>
          <Button onClick={handleSkip} className="bg-zinc-800 hover:bg-zinc-700">
            {t('skip')}
          </Button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-5')}>
        <Text variant="d1" className="font-semibold">
          {t('settings')}
        </Text>
        <div className="grid gap-3 md:grid-cols-3">
          <label htmlFor="focus-minutes" className="space-y-1">
            <Text variant="c1" color="basic-5">
              {t('focusMinutes')}
            </Text>
            <Input
              id="focus-minutes"
              type="number"
              inputMode="numeric"
              min={1}
              max={120}
              value={focusMinutes}
              onChange={(event) =>
                setFocusMinutes(clampNumber(parseMinutes(event.target.value, focusMinutes), 1, 120))
              }
            />
          </label>
          <label htmlFor="break-minutes" className="space-y-1">
            <Text variant="c1" color="basic-5">
              {t('breakMinutes')}
            </Text>
            <Input
              id="break-minutes"
              type="number"
              inputMode="numeric"
              min={1}
              max={60}
              value={breakMinutes}
              onChange={(event) =>
                setBreakMinutes(clampNumber(parseMinutes(event.target.value, breakMinutes), 1, 60))
              }
            />
          </label>
          <label htmlFor="goal-sessions" className="space-y-1">
            <Text variant="c1" color="basic-5">
              {t('goalSessions')}
            </Text>
            <Input
              id="goal-sessions"
              type="number"
              inputMode="numeric"
              min={1}
              max={12}
              value={goalSessions}
              onChange={(event) =>
                setGoalSessions(clampNumber(parseMinutes(event.target.value, goalSessions), 1, 12))
              }
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              onClick={() => applyPreset(preset.focus, preset.rest)}
              className="bg-zinc-900 hover:bg-zinc-700"
            >
              {t('preset', { value: preset.label })}
            </Button>
          ))}
        </div>
        <Text variant="c1" color="basic-5">
          {t('tip')}
        </Text>
      </section>
    </div>
  );
}
