'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const DEFAULT_COVERAGE = 10;
const DEFAULT_COATS = 2;
const DEFAULT_WALLS = 4;
const DEFAULT_CAN_SIZE = 3.7;

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

type PaintEstimatorClientProps = {
  lng: Language;
};

export default function PaintEstimatorClient({ lng }: PaintEstimatorClientProps) {
  const { t } = useTranslation(lng, 'paint-estimator');
  const [wallWidth, setWallWidth] = useState('');
  const [wallHeight, setWallHeight] = useState('');
  const [walls, setWalls] = useState(String(DEFAULT_WALLS));
  const [coats, setCoats] = useState(String(DEFAULT_COATS));
  const [coverage, setCoverage] = useState(String(DEFAULT_COVERAGE));
  const [canSize, setCanSize] = useState(String(DEFAULT_CAN_SIZE));

  const result = useMemo(() => {
    const width = toNumber(wallWidth);
    const height = toNumber(wallHeight);
    const wallCount = toNumber(walls);
    const coatCount = toNumber(coats);
    const coverageValue = toNumber(coverage);
    const canSizeValue = toNumber(canSize);

    const area = width * height * wallCount * coatCount;
    const liters = coverageValue > 0 ? area / coverageValue : 0;
    const cans = canSizeValue > 0 ? Math.ceil(liters / canSizeValue) : 0;

    return {
      area,
      liters,
      cans,
    };
  }, [wallWidth, wallHeight, walls, coats, coverage, canSize]);

  const reset = () => {
    setWallWidth('');
    setWallHeight('');
    setWalls(String(DEFAULT_WALLS));
    setCoats(String(DEFAULT_COATS));
    setCoverage(String(DEFAULT_COVERAGE));
    setCanSize(String(DEFAULT_CAN_SIZE));
  };

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('wallWidthLabel')}</span>
            <Input
              type="number"
              min={0}
              step="0.1"
              placeholder={t('wallWidthPlaceholder')}
              value={wallWidth}
              onChange={(event) => setWallWidth(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('wallHeightLabel')}</span>
            <Input
              type="number"
              min={0}
              step="0.1"
              placeholder={t('wallHeightPlaceholder')}
              value={wallHeight}
              onChange={(event) => setWallHeight(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('wallsLabel')}</span>
            <Input
              type="number"
              min={1}
              step="1"
              value={walls}
              onChange={(event) => setWalls(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('coatsLabel')}</span>
            <Input
              type="number"
              min={1}
              step="1"
              value={coats}
              onChange={(event) => setCoats(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('coverageLabel')}</span>
            <Input
              type="number"
              min={1}
              step="0.1"
              value={coverage}
              onChange={(event) => setCoverage(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('canSizeLabel')}</span>
            <Input
              type="number"
              min={0.5}
              step="0.1"
              value={canSize}
              onChange={(event) => setCanSize(event.target.value)}
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
          <p className="text-sm font-semibold text-gray-700">{t('areaLabel')}</p>
          <p className="text-lg font-semibold text-gray-800">
            {t('areaValue', { value: result.area.toFixed(1) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('litersLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('litersValue', { value: result.liters.toFixed(2) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('cansLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('cansValue', { value: result.cans })}
          </p>
        </div>
      </section>
    </div>
  );
}
