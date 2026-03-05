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

type WindUnit = 'mps' | 'kmh';

interface ApparentTemperatureClientProps {
  lng: Language;
}

const toNumber = (value: string) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const toFahrenheit = (celsius: number) => (celsius * 9) / 5 + 32;
const toCelsius = (fahrenheit: number) => ((fahrenheit - 32) * 5) / 9;

const calculateHeatIndex = (temperatureC: number, humidity: number) => {
  const temperatureF = toFahrenheit(temperatureC);
  const relativeHumidity = clamp(humidity, 0, 100);

  const heatIndexF =
    -42.379 +
    2.04901523 * temperatureF +
    10.14333127 * relativeHumidity -
    0.22475541 * temperatureF * relativeHumidity -
    0.00683783 * temperatureF * temperatureF -
    0.05481717 * relativeHumidity * relativeHumidity +
    0.00122874 * temperatureF * temperatureF * relativeHumidity +
    0.00085282 * temperatureF * relativeHumidity * relativeHumidity -
    0.00000199 * temperatureF * temperatureF * relativeHumidity * relativeHumidity;

  return toCelsius(heatIndexF);
};

const calculateWindChill = (temperatureC: number, windSpeedKmh: number) => {
  const speed = Math.max(windSpeedKmh, 0);
  return (
    13.12 + 0.6215 * temperatureC - 11.37 * speed ** 0.16 + 0.3965 * temperatureC * speed ** 0.16
  );
};

export default function ApparentTemperatureClient({ lng }: ApparentTemperatureClientProps) {
  const { t } = useTranslation(lng, 'apparent-temperature');
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [windSpeed, setWindSpeed] = useState('');
  const [windUnit, setWindUnit] = useState<WindUnit>('mps');

  const formatter = useMemo(() => {
    return new Intl.NumberFormat(localeMap[lng], {
      maximumFractionDigits: 1,
    });
  }, [lng]);

  const result = useMemo(() => {
    const temperatureValue = toNumber(temperature);
    const humidityValue = toNumber(humidity);
    const windSpeedValue = toNumber(windSpeed);

    if (temperatureValue === null || humidityValue === null || windSpeedValue === null) {
      return null;
    }

    const windSpeedKmh = windUnit === 'mps' ? windSpeedValue * 3.6 : windSpeedValue;
    const canUseHeatIndex = temperatureValue >= 27 && humidityValue >= 40;
    const canUseWindChill = temperatureValue <= 10 && windSpeedKmh >= 4.8;

    if (canUseHeatIndex) {
      return {
        value: calculateHeatIndex(temperatureValue, humidityValue),
        formula: 'heatIndex',
      };
    }

    if (canUseWindChill) {
      return {
        value: calculateWindChill(temperatureValue, windSpeedKmh),
        formula: 'windChill',
      };
    }

    return {
      value: temperatureValue,
      formula: 'actual',
    };
  }, [temperature, humidity, windSpeed, windUnit]);

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label
              htmlFor="apparent-temperature-input"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
            >
              {t('input.temperature')}
            </label>
            <Input
              id="apparent-temperature-input"
              type="text"
              inputMode="decimal"
              className="font-mono"
              placeholder={t('placeholder.temperature')}
              value={temperature}
              onChange={(event) => setTemperature(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="apparent-humidity-input"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
            >
              {t('input.humidity')}
            </label>
            <Input
              id="apparent-humidity-input"
              type="text"
              inputMode="decimal"
              className="font-mono"
              placeholder={t('placeholder.humidity')}
              value={humidity}
              onChange={(event) => setHumidity(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="apparent-wind-input"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
            >
              {t('input.windSpeed')}
            </label>
            <div className="flex gap-2">
              <Input
                id="apparent-wind-input"
                type="text"
                inputMode="decimal"
                className="font-mono"
                placeholder={t('placeholder.windSpeed')}
                value={windSpeed}
                onChange={(event) => setWindSpeed(event.target.value)}
              />
              <Select value={windUnit} onValueChange={(value) => setWindUnit(value as WindUnit)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mps">{t('windUnit.mps')}</SelectItem>
                  <SelectItem value="kmh">{t('windUnit.kmh')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('helper')}</p>
        <div className="grid gap-2 text-xs text-zinc-500 dark:text-zinc-400 sm:grid-cols-2">
          <span>• {t('tips.heat')}</span>
          <span>• {t('tips.cold')}</span>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {t('result.title')}
        </div>
        {result ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-200/70 bg-white/70 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60">
              <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                {t('result.feelsLike')}
              </p>
              <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {formatter.format(result.value)}
                <span className="ml-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  °C
                </span>
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200/70 bg-white/70 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60">
              <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                {t('result.formula')}
              </p>
              <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {t(`result.${result.formula}`)}
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
