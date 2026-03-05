'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

type OvenConverterClientProps = {
  lng: Language;
};

type Mode = 'cToF' | 'fToC';

const defaultTemps = [160, 170, 180, 190, 200, 210, 220];

export default function OvenConverterClient({ lng }: OvenConverterClientProps) {
  const { t } = useTranslation(lng, 'oven-converter');
  const [mode, setMode] = useState<Mode>('cToF');
  const [temperature, setTemperature] = useState('180');

  const result = useMemo(() => {
    const value = toNumber(temperature);
    if (mode === 'cToF') {
      return (value * 9) / 5 + 32;
    }
    return ((value - 32) * 5) / 9;
  }, [temperature, mode]);

  const quickTemps = defaultTemps.map((temp) =>
    mode === 'cToF' ? temp : Math.round((temp * 9) / 5 + 32),
  );

  const reset = () => {
    setMode('cToF');
    setTemperature('180');
  };

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">{t('modeLabel')}</p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: 'cToF', label: t('cToF') },
                { key: 'fToC', label: t('fToC') },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setMode(item.key)}
                className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium transition-colors',
                  mode === item.key
                    ? 'bg-point-2 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-semibold text-gray-700">{t('tempLabel')}</span>
          <Input
            type="number"
            min={0}
            step="1"
            value={temperature}
            onChange={(event) => setTemperature(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">{t('quickLabel')}</p>
          <div className="flex flex-wrap gap-2">
            {quickTemps.map((temp) => (
              <button
                key={temp}
                type="button"
                onClick={() => setTemperature(String(temp))}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
              >
                {temp}°
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-500">{t('tips')}</p>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={reset} className="px-4 bg-gray-200 text-gray-700">
            {t('reset')}
          </Button>
        </div>
      </section>

      <section className={`${SERVICE_PANEL_SOFT} space-y-2 p-4 text-center`}>
        <p className="text-sm font-semibold text-gray-700">{t('resultLabel')}</p>
        <p className="text-2xl font-bold text-gray-900">{result.toFixed(1)}°</p>
      </section>
    </div>
  );
}
