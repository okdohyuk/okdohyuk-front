'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

type Props = {
  lng: Language;
};

type Mode = 'time' | 'pace' | 'distance';

type PresetKey = '5k' | '10k' | 'half' | 'full';

type PresetDistance = {
  key: PresetKey;
  km: number;
};

const PRESET_DISTANCES: PresetDistance[] = [
  { key: '5k', km: 5 },
  { key: '10k', km: 10 },
  { key: 'half', km: 21.0975 },
  { key: 'full', km: 42.195 },
];

const parsePositive = (value: string) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    return null;
  }
  return num;
};

const toMinutes = (hours: number, minutes: number, seconds: number) =>
  hours * 60 + minutes + seconds / 60;

const formatClock = (totalMinutes: number) => {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
    return null;
  }

  const totalSeconds = Math.round(totalMinutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
};

const formatPace = (paceMinutesPerKm: number) => {
  if (!Number.isFinite(paceMinutesPerKm) || paceMinutesPerKm <= 0) {
    return null;
  }

  const totalSeconds = Math.round(paceMinutesPerKm * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default function RunningPaceCalculatorClient({ lng }: Props) {
  const { t } = useTranslation(lng, 'running-pace-calculator');
  const reduceMotion = useReducedMotion();

  const [mode, setMode] = useState<Mode>('time');
  const [distanceKm, setDistanceKm] = useState('10');
  const [paceMinute, setPaceMinute] = useState('5');
  const [paceSecond, setPaceSecond] = useState('30');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('55');
  const [seconds, setSeconds] = useState('0');

  const result = useMemo(() => {
    const distance = parsePositive(distanceKm);
    const paceMin = parsePositive(paceMinute);
    const paceSec = Number(paceSecond);
    const hourNum = Number(hours);
    const minuteNum = Number(minutes);
    const secondNum = Number(seconds);

    const validPaceSecond = Number.isFinite(paceSec) && paceSec >= 0 && paceSec < 60;
    const validHms =
      Number.isFinite(hourNum) &&
      hourNum >= 0 &&
      Number.isFinite(minuteNum) &&
      minuteNum >= 0 &&
      minuteNum < 60 &&
      Number.isFinite(secondNum) &&
      secondNum >= 0 &&
      secondNum < 60;

    if (mode === 'time') {
      if (!distance || !paceMin || !validPaceSecond) {
        return null;
      }

      const totalMinutes = distance * (paceMin + paceSec / 60);
      return {
        primary: t('result.totalTime', { value: formatClock(totalMinutes) }),
        secondary: t('result.pace', { value: formatPace(paceMin + paceSec / 60) }),
      };
    }

    if (mode === 'pace') {
      if (!distance || !validHms) {
        return null;
      }

      const totalMinutes = toMinutes(hourNum, minuteNum, secondNum);
      if (totalMinutes <= 0) {
        return null;
      }

      const pace = totalMinutes / distance;
      return {
        primary: t('result.pacePerKm', { value: formatPace(pace) }),
        secondary: t('result.totalTime', { value: formatClock(totalMinutes) }),
      };
    }

    if (!paceMin || !validPaceSecond || !validHms) {
      return null;
    }

    const totalMinutes = toMinutes(hourNum, minuteNum, secondNum);
    if (totalMinutes <= 0) {
      return null;
    }

    const calculatedDistance = totalMinutes / (paceMin + paceSec / 60);
    return {
      primary: t('result.distance', { value: calculatedDistance.toFixed(2) }),
      secondary: t('result.pace', { value: formatPace(paceMin + paceSec / 60) }),
    };
  }, [distanceKm, hours, minutes, mode, paceMinute, paceSecond, seconds, t]);

  const modeButtons: { key: Mode; label: string }[] = [
    { key: 'time', label: t('mode.time') },
    { key: 'pace', label: t('mode.pace') },
    { key: 'distance', label: t('mode.distance') },
  ];

  return (
    <div className="space-y-4">
      <section className={cn(SERVICE_PANEL_SOFT, 'p-2')}>
        <div className="grid grid-cols-3 gap-2">
          {modeButtons.map((item) => {
            const isActive = mode === item.key;
            return (
              <Button
                key={item.key}
                onClick={() => setMode(item.key)}
                className={cn(
                  'relative h-11 rounded-xl text-xs font-semibold transition-colors md:text-sm',
                  isActive
                    ? 'bg-point-4 text-white hover:bg-point-4/90'
                    : 'bg-zinc-200/70 text-zinc-700 hover:bg-zinc-300/80 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700',
                )}
              >
                {isActive ? (
                  <motion.span
                    layoutId="running-pace-mode-pill"
                    className="absolute inset-0 rounded-xl bg-point-4"
                    transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                  />
                ) : null}
                <span className="relative z-10">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <motion.section
          layout
          transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
          className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}
        >
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {t('label.distance')}
            </p>
            <Input
              type="number"
              inputMode="decimal"
              value={distanceKm}
              min={0}
              step="0.1"
              disabled={mode === 'distance'}
              onChange={(event) => setDistanceKm(event.target.value)}
              className="font-mono"
            />
            <div className="flex flex-wrap gap-2">
              {PRESET_DISTANCES.map((preset) => (
                <Button
                  key={preset.key}
                  onClick={() => setDistanceKm(String(preset.km))}
                  className="h-8 rounded-full bg-zinc-200/70 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  {t(`preset.${preset.key}` as const)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {t('label.pace')}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                value={paceMinute}
                disabled={mode === 'pace'}
                onChange={(event) => setPaceMinute(event.target.value)}
                className="font-mono"
              />
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={59}
                value={paceSecond}
                disabled={mode === 'pace'}
                onChange={(event) => setPaceSecond(event.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {t('label.time')}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                value={hours}
                disabled={mode === 'time'}
                onChange={(event) => setHours(event.target.value)}
                className="font-mono"
              />
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={59}
                value={minutes}
                disabled={mode === 'time'}
                onChange={(event) => setMinutes(event.target.value)}
                className="font-mono"
              />
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={59}
                value={seconds}
                disabled={mode === 'time'}
                onChange={(event) => setSeconds(event.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">{t(`helper.${mode}`)}</p>
        </motion.section>

        <section className={cn(SERVICE_PANEL_SOFT, 'min-h-[220px] overflow-hidden p-4')}>
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? {} : { opacity: 0, y: -10, scale: 0.985 }}
              transition={{ duration: reduceMotion ? 0 : 0.26, ease: [0.2, 0.8, 0.2, 1] }}
              className="space-y-3"
            >
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {t('result.title')}
              </p>
              {result ? (
                <>
                  <motion.p
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduceMotion ? 0 : 0.06, duration: 0.22 }}
                    className="rounded-2xl bg-point-1/15 px-4 py-5 text-xl font-bold text-point-1"
                  >
                    {result.primary}
                  </motion.p>
                  <p className="rounded-xl bg-zinc-100/80 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200">
                    {result.secondary}
                  </p>
                </>
              ) : (
                <p className="rounded-2xl border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  {t('result.invalid')}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
