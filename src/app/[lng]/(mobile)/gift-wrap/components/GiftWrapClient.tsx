'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const DEFAULT_ROLL_WIDTH = 70;
const DEFAULT_WASTE = 10;

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

type GiftWrapClientProps = {
  lng: Language;
};

export default function GiftWrapClient({ lng }: GiftWrapClientProps) {
  const { t } = useTranslation(lng, 'gift-wrap');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [rollWidth, setRollWidth] = useState(String(DEFAULT_ROLL_WIDTH));
  const [wastePercent, setWastePercent] = useState(String(DEFAULT_WASTE));

  const result = useMemo(() => {
    const l = toNumber(length);
    const w = toNumber(width);
    const h = toNumber(height);
    const rollW = toNumber(rollWidth);
    const waste = toNumber(wastePercent);

    const surfaceArea = 2 * (l * w + l * h + w * h);
    const totalArea = surfaceArea * (1 + waste / 100);
    const rollLength = rollW > 0 ? totalArea / rollW : 0;

    return {
      surfaceArea,
      totalArea,
      rollLength,
    };
  }, [length, width, height, rollWidth, wastePercent]);

  const reset = () => {
    setLength('');
    setWidth('');
    setHeight('');
    setRollWidth(String(DEFAULT_ROLL_WIDTH));
    setWastePercent(String(DEFAULT_WASTE));
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
            <span className="text-sm font-semibold text-gray-700">{t('rollWidthLabel')}</span>
            <Input
              type="number"
              min={10}
              step="1"
              value={rollWidth}
              onChange={(event) => setRollWidth(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('wasteLabel')}</span>
            <Input
              type="number"
              min={0}
              step="1"
              value={wastePercent}
              onChange={(event) => setWastePercent(event.target.value)}
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
          <p className="text-sm font-semibold text-gray-700">{t('surfaceAreaLabel')}</p>
          <p className="text-lg font-semibold text-gray-800">
            {t('areaValue', { value: result.surfaceArea.toFixed(0) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('totalAreaLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('areaValue', { value: result.totalArea.toFixed(0) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('rollLengthLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('cmValue', { value: result.rollLength.toFixed(0) })}
          </p>
        </div>
      </section>
    </div>
  );
}
