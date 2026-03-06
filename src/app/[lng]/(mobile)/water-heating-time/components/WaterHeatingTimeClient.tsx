'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const localeMap: Record<Language, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

type VolumeUnit = 'ml' | 'l';

interface WaterHeatingTimeClientProps {
  lng: Language;
}

const SPECIFIC_HEAT_WATER = 4186;

const toNumber = (value: string) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

export default function WaterHeatingTimeClient({ lng }: WaterHeatingTimeClientProps) {
  const { t } = useTranslation(lng, 'water-heating-time');
  const [volume, setVolume] = useState('');
  const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('ml');
  const [startTemp, setStartTemp] = useState('20');
  const [targetTemp, setTargetTemp] = useState('100');
  const [power, setPower] = useState('1500');
  const [efficiency, setEfficiency] = useState('85');

  const formatter = useMemo(() => {
    return new Intl.NumberFormat(localeMap[lng], {
      maximumFractionDigits: 2,
    });
  }, [lng]);

  const result = useMemo(() => {
    const volumeValue = toNumber(volume);
    const startValue = toNumber(startTemp);
    const targetValue = toNumber(targetTemp);
    const powerValue = toNumber(power);
    const efficiencyValue = toNumber(efficiency);

    if (
      volumeValue === null ||
      startValue === null ||
      targetValue === null ||
      powerValue === null ||
      efficiencyValue === null
    ) {
      return null;
    }

    if (volumeValue <= 0 || powerValue <= 0 || efficiencyValue <= 0) {
      return null;
    }

    const delta = targetValue - startValue;
    if (delta <= 0) {
      return null;
    }

    const liters = volumeUnit === 'ml' ? volumeValue / 1000 : volumeValue;
    const massKg = liters;
    const energyJoules = massKg * SPECIFIC_HEAT_WATER * delta;
    const effectivePower = powerValue * (efficiencyValue / 100);
    const totalSeconds = energyJoules / effectivePower;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.round(totalSeconds % 60);

    return {
      energyKJ: energyJoules / 1000,
      minutes,
      seconds,
      effectivePower,
    };
  }, [volume, volumeUnit, startTemp, targetTemp, power, efficiency]);

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="water-volume-input"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
            >
              {t('input.volume')}
            </label>
            <div className="flex gap-2">
              <Input
                id="water-volume-input"
                type="text"
                inputMode="decimal"
                className="font-mono"
                placeholder={t('placeholder.volume')}
                value={volume}
                onChange={(event) => setVolume(event.target.value)}
              />
              <Select
                value={volumeUnit}
                onValueChange={(value) => setVolumeUnit(value as VolumeUnit)}
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ml">{t('unit.ml')}</SelectItem>
                  <SelectItem value="l">{t('unit.l')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="water-power-input"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
            >
              {t('input.power')}
            </label>
            <Input
              id="water-power-input"
              type="text"
              inputMode="decimal"
              className="font-mono"
              placeholder={t('placeholder.power')}
              value={power}
              onChange={(event) => setPower(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="water-start-temp"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
            >
              {t('input.startTemp')}
            </label>
            <Input
              id="water-start-temp"
              type="text"
              inputMode="decimal"
              className="font-mono"
              placeholder={t('placeholder.startTemp')}
              value={startTemp}
              onChange={(event) => setStartTemp(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="water-target-temp"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
            >
              {t('input.targetTemp')}
            </label>
            <Input
              id="water-target-temp"
              type="text"
              inputMode="decimal"
              className="font-mono"
              placeholder={t('placeholder.targetTemp')}
              value={targetTemp}
              onChange={(event) => setTargetTemp(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="water-efficiency"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
            >
              {t('input.efficiency')}
            </label>
            <Input
              id="water-efficiency"
              type="text"
              inputMode="decimal"
              className="font-mono"
              placeholder={t('placeholder.efficiency')}
              value={efficiency}
              onChange={(event) => setEfficiency(event.target.value)}
            />
          </div>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('helper')}</p>
        <div className="grid gap-2 text-xs text-zinc-500 dark:text-zinc-400 sm:grid-cols-2">
          <span>• {t('tips.power')}</span>
          <span>• {t('tips.loss')}</span>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {t('result.title')}
        </div>
        {result ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-200/70 bg-white/70 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60">
              <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                {t('result.time')}
              </p>
              <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {result.minutes}
                <span className="ml-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {t('unit.min')}
                </span>{' '}
                {result.seconds}
                <span className="ml-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {t('unit.sec')}
                </span>
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200/70 bg-white/70 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60">
              <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                {t('result.energy')}
              </p>
              <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {formatter.format(result.energyKJ)}
                <span className="ml-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  kJ
                </span>
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200/70 bg-white/70 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60">
              <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                {t('result.effectivePower')}
              </p>
              <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {formatter.format(result.effectivePower)}
                <span className="ml-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">W</span>
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('result.none')}</p>
        )}
      </div>
    </div>
  );
}
