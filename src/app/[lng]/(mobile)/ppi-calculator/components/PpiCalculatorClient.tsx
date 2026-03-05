'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const INCH_TO_CM = 2.54;

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

type PpiCalculatorClientProps = {
  lng: Language;
};

export default function PpiCalculatorClient({ lng }: PpiCalculatorClientProps) {
  const { t } = useTranslation(lng, 'ppi-calculator');
  const [diagonal, setDiagonal] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  const result = useMemo(() => {
    const diagonalValue = toNumber(diagonal);
    const widthValue = toNumber(width);
    const heightValue = toNumber(height);

    const diagonalPixels = Math.sqrt(widthValue ** 2 + heightValue ** 2);
    const ppi = diagonalValue > 0 ? diagonalPixels / diagonalValue : 0;
    const pixelPitchMm = ppi > 0 ? 25.4 / ppi : 0;
    const diagonalCm = diagonalValue * INCH_TO_CM;

    return {
      diagonalPixels,
      ppi,
      pixelPitchMm,
      diagonalCm,
    };
  }, [diagonal, width, height]);

  const reset = () => {
    setDiagonal('');
    setWidth('');
    setHeight('');
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
              step="0.1"
              placeholder={t('diagonalPlaceholder')}
              value={diagonal}
              onChange={(event) => setDiagonal(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('widthLabel')}</span>
            <Input
              type="number"
              min={0}
              step="1"
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
              step="1"
              placeholder={t('heightPlaceholder')}
              value={height}
              onChange={(event) => setHeight(event.target.value)}
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
          <p className="text-sm font-semibold text-gray-700">{t('diagonalPixelsLabel')}</p>
          <p className="text-lg font-semibold text-gray-800">
            {t('pixelsValue', { value: result.diagonalPixels.toFixed(0) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('ppiLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('ppiValue', { value: result.ppi.toFixed(1) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('pixelPitchLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('mmValue', { value: result.pixelPitchMm.toFixed(3) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('diagonalCmLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('cmValue', { value: result.diagonalCm.toFixed(1) })}
          </p>
        </div>
      </section>
    </div>
  );
}
