'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { Text } from '@components/basic/Text';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import { Play, Pause, RotateCcw } from 'lucide-react';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

type PhaseKey = 'warmup' | 'work' | 'rest' | 'cooldown';

type Step = {
  id: string;
  key: PhaseKey;
  duration: number;
  round?: number;
};

interface IntervalTimerClientProps {
  lng: Language;
}

const formatTime = (value: number) => {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default function IntervalTimerClient({ lng }: IntervalTimerClientProps) {
  const { t } = useTranslation(lng, 'interval-timer');
  const [warmup, setWarmup] = useState(10);
  const [work, setWork] = useState(30);
  const [rest, setRest] = useState(15);
  const [rounds, setRounds] = useState(8);
  const [cooldown, setCooldown] = useState(20);
  const [status, setStatus] = useState<'ready' | 'running' | 'paused' | 'finished'>('ready');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');

  const schedule = useMemo(() => {
    const steps: Step[] = [];
    let counter = 0;
    const createId = (key: PhaseKey, round?: number) => {
      counter += 1;
      return `${key}-${round ?? 'base'}-${counter}`;
    };

    if (warmup > 0) {
      steps.push({ id: createId('warmup'), key: 'warmup', duration: warmup });
    }
    const safeRounds = Math.max(rounds, 0);
    for (let round = 1; round <= safeRounds; round += 1) {
      if (work > 0) {
        steps.push({ id: createId('work', round), key: 'work', duration: work, round });
      }
      if (rest > 0 && round < safeRounds) {
        steps.push({ id: createId('rest', round), key: 'rest', duration: rest, round });
      }
    }
    if (cooldown > 0) {
      steps.push({ id: createId('cooldown'), key: 'cooldown', duration: cooldown });
    }
    return steps;
  }, [warmup, work, rest, rounds, cooldown]);

  const totalSeconds = useMemo(
    () => schedule.reduce((acc, step) => acc + step.duration, 0),
    [schedule],
  );

  const currentStep = schedule[currentStepIndex];
  const stepProgress = currentStep ? Math.min(1, remaining / currentStep.duration) : 0;
  const totalRemaining = Math.max(totalSeconds - elapsed, 0);

  useEffect(() => {
    if (status === 'ready') {
      setCurrentStepIndex(0);
      setRemaining(schedule[0]?.duration ?? 0);
      setElapsed(0);
    }
  }, [schedule, status]);

  useEffect(() => {
    if (status !== 'running') {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setRemaining((prev) => Math.max(prev - 1, 0));
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status !== 'running') {
      return undefined;
    }

    if (remaining <= 0) {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < schedule.length) {
        setCurrentStepIndex(nextIndex);
        setRemaining(schedule[nextIndex].duration);
      } else {
        setStatus('finished');
      }
    }
    return undefined;
  }, [remaining, status, currentStepIndex, schedule]);

  const handleStart = () => {
    if (totalSeconds === 0) {
      setError(t('errors.noDuration'));
      return;
    }
    setError('');
    setStatus('running');
    setCurrentStepIndex(0);
    setRemaining(schedule[0]?.duration ?? 0);
    setElapsed(0);
  };

  const handlePause = () => {
    setStatus('paused');
  };

  const handleResume = () => {
    setStatus('running');
  };

  const handleReset = () => {
    setError('');
    setStatus('ready');
    setCurrentStepIndex(0);
    setRemaining(schedule[0]?.duration ?? 0);
    setElapsed(0);
  };

  const handlePreset = (preset: 'tabata' | 'quick' | 'focus') => {
    if (status === 'running') {
      return;
    }
    if (preset === 'tabata') {
      setWarmup(10);
      setWork(20);
      setRest(10);
      setRounds(8);
      setCooldown(10);
    }
    if (preset === 'quick') {
      setWarmup(5);
      setWork(30);
      setRest(15);
      setRounds(10);
      setCooldown(10);
    }
    if (preset === 'focus') {
      setWarmup(30);
      setWork(50);
      setRest(10);
      setRounds(4);
      setCooldown(30);
    }
  };

  const inputsDisabled = status === 'running' || status === 'paused';

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <Text variant="t4" className="font-semibold text-gray-900 dark:text-gray-100">
          {t('labels.presets')}
        </Text>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => handlePreset('tabata')}
            className="px-3 py-2 text-sm"
          >
            {t('presets.tabata')}
          </Button>
          <Button type="button" onClick={() => handlePreset('quick')} className="px-3 py-2 text-sm">
            {t('presets.quick')}
          </Button>
          <Button type="button" onClick={() => handlePreset('focus')} className="px-3 py-2 text-sm">
            {t('presets.focus')}
          </Button>
        </div>
        <Text className="text-sm text-gray-500 dark:text-gray-400">{t('helper')}</Text>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <Text variant="t4" className="font-semibold text-gray-900 dark:text-gray-100">
          {t('labels.settings')}
        </Text>
        <div className="grid gap-4 sm:grid-cols-2">
          <label
            htmlFor="interval-warmup"
            className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <span>{t('labels.warmup')}</span>
            <Input
              id="interval-warmup"
              type="number"
              min={0}
              inputMode="numeric"
              value={warmup}
              disabled={inputsDisabled}
              onChange={(event) => setWarmup(Number(event.target.value))}
            />
          </label>
          <label
            htmlFor="interval-work"
            className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <span>{t('labels.work')}</span>
            <Input
              id="interval-work"
              type="number"
              min={0}
              inputMode="numeric"
              value={work}
              disabled={inputsDisabled}
              onChange={(event) => setWork(Number(event.target.value))}
            />
          </label>
          <label
            htmlFor="interval-rest"
            className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <span>{t('labels.rest')}</span>
            <Input
              id="interval-rest"
              type="number"
              min={0}
              inputMode="numeric"
              value={rest}
              disabled={inputsDisabled}
              onChange={(event) => setRest(Number(event.target.value))}
            />
          </label>
          <label
            htmlFor="interval-rounds"
            className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <span>{t('labels.rounds')}</span>
            <Input
              id="interval-rounds"
              type="number"
              min={1}
              inputMode="numeric"
              value={rounds}
              disabled={inputsDisabled}
              onChange={(event) => setRounds(Number(event.target.value))}
            />
          </label>
          <label
            htmlFor="interval-cooldown"
            className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <span>{t('labels.cooldown')}</span>
            <Input
              id="interval-cooldown"
              type="number"
              min={0}
              inputMode="numeric"
              value={cooldown}
              disabled={inputsDisabled}
              onChange={(event) => setCooldown(Number(event.target.value))}
            />
          </label>
        </div>
        {error && <Text className="text-sm text-red-500">{error}</Text>}
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-6 p-4')}>
        <div className="space-y-2">
          <Text variant="t3" className="font-semibold text-gray-900 dark:text-gray-100">
            {t('labels.currentPhase')}
          </Text>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-point-1/15 px-3 py-1 text-sm font-medium text-point-1">
              {currentStep ? t(`phases.${currentStep.key}`) : t('status.ready')}
            </span>
            {currentStep?.round && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('labels.round')} {currentStep.round}/{rounds}
              </span>
            )}
          </div>
          <div className="text-4xl font-semibold text-gray-900 dark:text-gray-100">
            {formatTime(remaining)}
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              className="h-2 rounded-full bg-point-1 transition-all"
              style={{ width: `${stepProgress * 100}%` }}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-900/60 dark:text-gray-300">
            <Text className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
              {t('labels.totalTime')}
            </Text>
            <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {formatTime(totalSeconds)}
            </Text>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-900/60 dark:text-gray-300">
            <Text className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
              {t('labels.remaining')}
            </Text>
            <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {formatTime(totalRemaining)}
            </Text>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {status !== 'running' && status !== 'paused' && (
            <Button onClick={handleStart} className="flex items-center gap-2 px-4 py-2 text-sm">
              <Play size={16} />
              {t('buttons.start')}
            </Button>
          )}
          {status === 'running' && (
            <Button onClick={handlePause} className="flex items-center gap-2 px-4 py-2 text-sm">
              <Pause size={16} />
              {t('buttons.pause')}
            </Button>
          )}
          {status === 'paused' && (
            <Button onClick={handleResume} className="flex items-center gap-2 px-4 py-2 text-sm">
              <Play size={16} />
              {t('buttons.resume')}
            </Button>
          )}
          <Button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
          >
            <RotateCcw size={16} />
            {t('buttons.reset')}
          </Button>
        </div>

        <Text className="text-sm text-gray-500 dark:text-gray-400">{t(`status.${status}`)}</Text>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text variant="t4" className="font-semibold text-gray-900 dark:text-gray-100">
          {t('labels.timeline')}
        </Text>
        <div className="space-y-2">
          {schedule.length === 0 && (
            <Text className="text-sm text-gray-500 dark:text-gray-400">{t('empty')}</Text>
          )}
          {schedule.map((step) => (
            <div
              key={step.id}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:bg-gray-900/60 dark:text-gray-300"
            >
              <span>
                {t(`phases.${step.key}`)}
                {step.round ? ` · ${t('labels.round')} ${step.round}` : ''}
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatTime(step.duration)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
