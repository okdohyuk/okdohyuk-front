'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { H1, Text } from '@components/basic/Text';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { cn } from '@utils/cn';
import {
  SERVICE_PANEL,
  SERVICE_PANEL_SOFT,
  SERVICE_CARD_INTERACTIVE,
} from '@components/complex/Service/interactiveStyles';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const formatTime = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

type BreathingTimerClientProps = {
  lng: Language;
};

type Phase = {
  key: string;
  label: string;
  seconds: number;
};

export default function BreathingTimerClient({ lng }: BreathingTimerClientProps) {
  const { t } = useTranslation(lng, 'breathing-timer');

  const [inhale, setInhale] = useState(4);
  const [hold, setHold] = useState(4);
  const [exhale, setExhale] = useState(4);
  const [holdAfter, setHoldAfter] = useState(4);
  const [cycles, setCycles] = useState(4);

  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(1);

  const phaseIndexRef = useRef(0);
  const remainingRef = useRef(0);
  const cycleRef = useRef(1);

  const phases = useMemo<Phase[]>(() => {
    return [
      { key: 'inhale', label: t('phases.inhale'), seconds: inhale },
      { key: 'hold', label: t('phases.hold'), seconds: hold },
      { key: 'exhale', label: t('phases.exhale'), seconds: exhale },
      { key: 'holdAfter', label: t('phases.holdAfter'), seconds: holdAfter },
    ].filter((phase) => phase.seconds > 0);
  }, [exhale, hold, holdAfter, inhale, t]);

  const totalPerCycle = useMemo(
    () => phases.reduce((acc, phase) => acc + phase.seconds, 0),
    [phases],
  );

  const totalSession = totalPerCycle * cycles;

  const activePhase = phases[phaseIndex] ?? {
    key: 'ready',
    label: t('phases.ready'),
    seconds: 0,
  };

  useEffect(() => {
    if (!isRunning) {
      phaseIndexRef.current = 0;
      cycleRef.current = 1;
      remainingRef.current = phases[0]?.seconds ?? 0;
      setPhaseIndex(0);
      setCurrentCycle(1);
      setRemaining(remainingRef.current);
    }
  }, [isRunning, phases]);

  useEffect(() => {
    if (!isRunning) {
      return () => undefined;
    }
    if (!phases.length || totalPerCycle === 0) {
      setIsRunning(false);
      return () => undefined;
    }

    const timer = setInterval(() => {
      if (remainingRef.current > 1) {
        remainingRef.current -= 1;
        setRemaining(remainingRef.current);
      } else {
        const nextIndex = phaseIndexRef.current + 1;
        if (nextIndex < phases.length) {
          phaseIndexRef.current = nextIndex;
          remainingRef.current = phases[nextIndex].seconds;
          setPhaseIndex(nextIndex);
          setRemaining(remainingRef.current);
        } else if (cycleRef.current >= cycles) {
          setIsRunning(false);
        } else {
          cycleRef.current += 1;
          phaseIndexRef.current = 0;
          remainingRef.current = phases[0]?.seconds ?? 0;
          setCurrentCycle(cycleRef.current);
          setPhaseIndex(0);
          setRemaining(remainingRef.current);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [cycles, isRunning, phases, totalPerCycle]);

  const handleNumberChange = (
    nextValue: string,
    setter: React.Dispatch<React.SetStateAction<number>>,
    max = 60,
  ) => {
    const parsed = Number(nextValue);
    if (Number.isNaN(parsed)) {
      setter(0);
    } else {
      setter(clamp(Math.floor(parsed), 0, max));
    }
  };

  const applyPreset = (preset: {
    inhale: number;
    hold: number;
    exhale: number;
    holdAfter: number;
    cycles: number;
  }) => {
    setIsRunning(false);
    setInhale(preset.inhale);
    setHold(preset.hold);
    setExhale(preset.exhale);
    setHoldAfter(preset.holdAfter);
    setCycles(preset.cycles);
  };

  const handleStart = () => {
    if (isRunning || !phases.length || totalPerCycle === 0) return;
    phaseIndexRef.current = 0;
    cycleRef.current = 1;
    remainingRef.current = phases[0]?.seconds ?? 0;
    setPhaseIndex(0);
    setCurrentCycle(1);
    setRemaining(remainingRef.current);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    phaseIndexRef.current = 0;
    cycleRef.current = 1;
    remainingRef.current = phases[0]?.seconds ?? 0;
    setPhaseIndex(0);
    setCurrentCycle(1);
    setRemaining(remainingRef.current);
  };

  return (
    <div className="space-y-4">
      <section className={cn(SERVICE_PANEL, 'px-5 py-6 md:px-7 md:py-7')}>
        <Text className="mb-2 inline-flex rounded-full bg-point-1/10 px-3 py-1" variant="c1">
          {t('badge')}
        </Text>
        <H1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
          {t('title')}
        </H1>
        <Text
          className="mt-2 block text-sm leading-relaxed text-zinc-600 dark:text-zinc-300"
          variant="d3"
        >
          {t('description')}
        </Text>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <Text className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200" variant="d3">
          {t('labels.settings')}
        </Text>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="flex flex-col gap-2">
            <Text variant="c1" className="uppercase tracking-wide text-zinc-500">
              {t('labels.inhale')}
            </Text>
            <Input
              type="number"
              min={0}
              max={60}
              value={inhale}
              disabled={isRunning}
              onChange={(event) => handleNumberChange(event.target.value, setInhale)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Text variant="c1" className="uppercase tracking-wide text-zinc-500">
              {t('labels.hold')}
            </Text>
            <Input
              type="number"
              min={0}
              max={60}
              value={hold}
              disabled={isRunning}
              onChange={(event) => handleNumberChange(event.target.value, setHold)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Text variant="c1" className="uppercase tracking-wide text-zinc-500">
              {t('labels.exhale')}
            </Text>
            <Input
              type="number"
              min={0}
              max={60}
              value={exhale}
              disabled={isRunning}
              onChange={(event) => handleNumberChange(event.target.value, setExhale)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Text variant="c1" className="uppercase tracking-wide text-zinc-500">
              {t('labels.holdAfter')}
            </Text>
            <Input
              type="number"
              min={0}
              max={60}
              value={holdAfter}
              disabled={isRunning}
              onChange={(event) => handleNumberChange(event.target.value, setHoldAfter)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Text variant="c1" className="uppercase tracking-wide text-zinc-500">
              {t('labels.cycles')}
            </Text>
            <Input
              type="number"
              min={1}
              max={30}
              value={cycles}
              disabled={isRunning}
              onChange={(event) => handleNumberChange(event.target.value, setCycles, 30)}
            />
          </div>
        </div>
        <Text className="block text-xs text-zinc-500" variant="c1">
          {t('helper')}
        </Text>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200" variant="d3">
          {t('labels.presets')}
        </Text>
        <div className="flex flex-wrap gap-2">
          <Button
            className={cn('px-4 py-2 text-sm', SERVICE_CARD_INTERACTIVE)}
            type="button"
            onClick={() => applyPreset({ inhale: 4, hold: 4, exhale: 4, holdAfter: 4, cycles: 4 })}
          >
            {t('presets.box')}
          </Button>
          <Button
            className={cn('px-4 py-2 text-sm', SERVICE_CARD_INTERACTIVE)}
            type="button"
            onClick={() => applyPreset({ inhale: 4, hold: 7, exhale: 8, holdAfter: 0, cycles: 4 })}
          >
            {t('presets.fourSevenEight')}
          </Button>
          <Button
            className={cn('px-4 py-2 text-sm', SERVICE_CARD_INTERACTIVE)}
            type="button"
            onClick={() => applyPreset({ inhale: 6, hold: 2, exhale: 6, holdAfter: 2, cycles: 5 })}
          >
            {t('presets.calm')}
          </Button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL, 'space-y-4 px-5 py-6')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Text variant="c1" className="uppercase tracking-wide text-zinc-500">
              {t('labels.phase')}
            </Text>
            <Text
              className="mt-1 block text-2xl font-semibold text-zinc-900 dark:text-zinc-50"
              variant="t3"
            >
              {activePhase.label}
            </Text>
          </div>
          <div className="text-right">
            <Text variant="c1" className="uppercase tracking-wide text-zinc-500">
              {t('labels.remaining')}
            </Text>
            <Text
              className="mt-1 block text-2xl font-semibold text-zinc-900 dark:text-zinc-50"
              variant="t3"
            >
              {formatTime(remaining)}
            </Text>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-4 text-center shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/70">
            <Text variant="c1" className="uppercase tracking-wide text-zinc-500">
              {t('labels.cycle')}
            </Text>
            <Text className="mt-1 block text-xl font-semibold" variant="t3">
              {currentCycle}/{cycles}
            </Text>
          </div>
          <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-4 text-center shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/70">
            <Text variant="c1" className="uppercase tracking-wide text-zinc-500">
              {t('labels.totalPerCycle')}
            </Text>
            <Text className="mt-1 block text-xl font-semibold" variant="t3">
              {formatTime(totalPerCycle)}
            </Text>
          </div>
          <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-4 text-center shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/70">
            <Text variant="c1" className="uppercase tracking-wide text-zinc-500">
              {t('labels.totalSession')}
            </Text>
            <Text className="mt-1 block text-xl font-semibold" variant="t3">
              {formatTime(totalSession)}
            </Text>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            className="px-5 py-2 text-sm"
            type="button"
            onClick={handleStart}
            disabled={isRunning || totalPerCycle === 0}
          >
            {t('buttons.start')}
          </Button>
          <Button
            className="px-5 py-2 text-sm"
            type="button"
            onClick={handlePause}
            disabled={!isRunning}
          >
            {t('buttons.pause')}
          </Button>
          <Button className="px-5 py-2 text-sm" type="button" onClick={handleReset}>
            {t('buttons.reset')}
          </Button>
        </div>
      </section>
    </div>
  );
}
