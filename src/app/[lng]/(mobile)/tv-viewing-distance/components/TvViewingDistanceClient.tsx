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

type TvViewingDistanceClientProps = {
  lng: Language;
};

export default function TvViewingDistanceClient({ lng }: TvViewingDistanceClientProps) {
  const { t } = useTranslation(lng, 'tv-viewing-distance');
  const [screenInches, setScreenInches] = useState('');

  const result = useMemo(() => {
    const inches = toNumber(screenInches);
    const diagonalCm = inches * INCH_TO_CM;
    const cinemaDistance = diagonalCm * 1.5;
    const standardDistance = diagonalCm * 2.5;

    return {
      diagonalCm,
      cinemaDistance,
      standardDistance,
    };
  }, [screenInches]);

  const reset = () => {
    setScreenInches('');
  };

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="space-y-2">
          <span className="text-sm font-semibold text-gray-700">{t('screenLabel')}</span>
          <Input
            type="number"
            min={0}
            step="1"
            placeholder={t('screenPlaceholder')}
            value={screenInches}
            onChange={(event) => setScreenInches(event.target.value)}
          />
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
          <p className="text-sm font-semibold text-gray-700">{t('diagonalLabel')}</p>
          <p className="text-lg font-semibold text-gray-800">
            {t('cmValue', { value: result.diagonalCm.toFixed(1) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('cinemaLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('cmValue', { value: result.cinemaDistance.toFixed(0) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('standardLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('cmValue', { value: result.standardDistance.toFixed(0) })}
          </p>
        </div>
      </section>
    </div>
  );
}
