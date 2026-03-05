'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const DEFAULT_WALLS = 1;
const DEFAULT_WASTE = 10;
const DEFAULT_ROLL_WIDTH = 53;
const DEFAULT_ROLL_LENGTH = 10;

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

type WallpaperRollClientProps = {
  lng: Language;
};

export default function WallpaperRollClient({ lng }: WallpaperRollClientProps) {
  const { t } = useTranslation(lng, 'wallpaper-roll');
  const [wallWidth, setWallWidth] = useState('');
  const [wallHeight, setWallHeight] = useState('');
  const [walls, setWalls] = useState(String(DEFAULT_WALLS));
  const [rollWidth, setRollWidth] = useState(String(DEFAULT_ROLL_WIDTH));
  const [rollLength, setRollLength] = useState(String(DEFAULT_ROLL_LENGTH));
  const [wastePercent, setWastePercent] = useState(String(DEFAULT_WASTE));

  const result = useMemo(() => {
    const width = toNumber(wallWidth);
    const height = toNumber(wallHeight);
    const wallCount = toNumber(walls);
    const rollWidthValue = toNumber(rollWidth);
    const rollLengthValue = toNumber(rollLength);
    const waste = toNumber(wastePercent);

    const wallArea = width * height * wallCount;
    const rollArea = rollWidthValue > 0 ? (rollWidthValue / 100) * rollLengthValue : 0;
    const baseRolls = rollArea > 0 ? wallArea / rollArea : 0;
    const totalRolls = Math.ceil(baseRolls * (1 + waste / 100));

    return {
      wallArea,
      rollArea,
      totalRolls,
    };
  }, [wallWidth, wallHeight, walls, rollWidth, rollLength, wastePercent]);

  const reset = () => {
    setWallWidth('');
    setWallHeight('');
    setWalls(String(DEFAULT_WALLS));
    setRollWidth(String(DEFAULT_ROLL_WIDTH));
    setRollLength(String(DEFAULT_ROLL_LENGTH));
    setWastePercent(String(DEFAULT_WASTE));
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
            <span className="text-sm font-semibold text-gray-700">{t('rollLengthLabel')}</span>
            <Input
              type="number"
              min={1}
              step="0.5"
              value={rollLength}
              onChange={(event) => setRollLength(event.target.value)}
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
          <p className="text-sm font-semibold text-gray-700">{t('wallAreaLabel')}</p>
          <p className="text-lg font-semibold text-gray-800">
            {t('areaValue', { value: result.wallArea.toFixed(2) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('rollAreaLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('areaValue', { value: result.rollArea.toFixed(2) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('rollsLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('rollsValue', { value: result.totalRolls })}
          </p>
        </div>
      </section>
    </div>
  );
}
