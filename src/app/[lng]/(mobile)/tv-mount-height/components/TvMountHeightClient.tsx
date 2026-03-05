'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const INCH_TO_CM = 2.54;
const HEIGHT_RATIO_16_9 = 0.49;

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

type TvMountHeightClientProps = {
  lng: Language;
};

export default function TvMountHeightClient({ lng }: TvMountHeightClientProps) {
  const { t } = useTranslation(lng, 'tv-mount-height');
  const [diagonal, setDiagonal] = useState('55');
  const [eyeHeight, setEyeHeight] = useState('100');
  const [offset, setOffset] = useState('0');

  const result = useMemo(() => {
    const diagonalValue = toNumber(diagonal);
    const eyeHeightValue = toNumber(eyeHeight);
    const offsetValue = toNumber(offset);

    const screenHeight = diagonalValue * INCH_TO_CM * HEIGHT_RATIO_16_9;
    const centerHeight = eyeHeightValue + offsetValue;
    const topHeight = centerHeight + screenHeight / 2;
    const bottomHeight = centerHeight - screenHeight / 2;

    return {
      screenHeight,
      centerHeight,
      topHeight,
      bottomHeight,
    };
  }, [diagonal, eyeHeight, offset]);

  const reset = () => {
    setDiagonal('55');
    setEyeHeight('100');
    setOffset('0');
  };

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('diagonalLabel')}</span>
            <Input
              type="number"
              min={0}
              step="1"
              value={diagonal}
              onChange={(event) => setDiagonal(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('eyeHeightLabel')}</span>
            <Input
              type="number"
              min={0}
              step="1"
              value={eyeHeight}
              onChange={(event) => setEyeHeight(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('offsetLabel')}</span>
            <Input
              type="number"
              step="1"
              value={offset}
              onChange={(event) => setOffset(event.target.value)}
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
          <p className="text-sm font-semibold text-gray-700">{t('screenHeightLabel')}</p>
          <p className="text-lg font-semibold text-gray-800">
            {t('cmValue', { value: result.screenHeight.toFixed(1) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('centerHeightLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('cmValue', { value: result.centerHeight.toFixed(1) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('topHeightLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('cmValue', { value: result.topHeight.toFixed(1) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('bottomHeightLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('cmValue', { value: result.bottomHeight.toFixed(1) })}
          </p>
        </div>
      </section>
    </div>
  );
}
