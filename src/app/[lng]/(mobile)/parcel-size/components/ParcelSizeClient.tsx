'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const DEFAULT_DIVISOR = 5000;

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

type ParcelSizeClientProps = {
  lng: Language;
};

export default function ParcelSizeClient({ lng }: ParcelSizeClientProps) {
  const { t } = useTranslation(lng, 'parcel-size');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [divisor, setDivisor] = useState(String(DEFAULT_DIVISOR));

  const result = useMemo(() => {
    const l = toNumber(length);
    const w = toNumber(width);
    const h = toNumber(height);
    const weightValue = toNumber(weight);
    const divisorValue = toNumber(divisor) || DEFAULT_DIVISOR;

    const volumeWeight = l * w * h > 0 ? (l * w * h) / divisorValue : 0;
    const chargeableWeight = Math.max(weightValue, volumeWeight);

    return {
      volumeWeight,
      chargeableWeight,
    };
  }, [length, width, height, weight, divisor]);

  const reset = () => {
    setLength('');
    setWidth('');
    setHeight('');
    setWeight('');
    setDivisor(String(DEFAULT_DIVISOR));
  };

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('lengthLabel')}</span>
            <Input
              type="number"
              min={0}
              step="0.1"
              placeholder={t('lengthPlaceholder')}
              value={length}
              onChange={(event) => setLength(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('widthLabel')}</span>
            <Input
              type="number"
              min={0}
              step="0.1"
              placeholder={t('widthPlaceholder')}
              value={width}
              onChange={(event) => setWidth(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('heightLabel')}</span>
            <Input
              type="number"
              min={0}
              step="0.1"
              placeholder={t('heightPlaceholder')}
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('weightLabel')}</span>
            <Input
              type="number"
              min={0}
              step="0.1"
              placeholder={t('weightPlaceholder')}
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('divisorLabel')}</span>
            <Input
              type="number"
              min={1000}
              step="100"
              value={divisor}
              onChange={(event) => setDivisor(event.target.value)}
            />
          </div>
        </div>

        <p className="text-xs text-gray-500">{t('tips')}</p>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={reset} className="px-4 bg-gray-200 text-gray-700">
            {t('reset')}
          </Button>
        </div>
      </section>

      <section className={`${SERVICE_PANEL_SOFT} space-y-3 p-4`}>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('volumeWeightLabel')}</p>
          <p className="text-lg font-semibold text-gray-800">
            {t('kgValue', { value: result.volumeWeight.toFixed(2) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('chargeableWeightLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('kgValue', { value: result.chargeableWeight.toFixed(2) })}
          </p>
        </div>
      </section>
    </div>
  );
}
