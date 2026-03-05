'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const DEFAULT_WASTE = 10;
const DEFAULT_TILES_PER_BOX = 10;

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

type TileCalculatorClientProps = {
  lng: Language;
};

export default function TileCalculatorClient({ lng }: TileCalculatorClientProps) {
  const { t } = useTranslation(lng, 'tile-calculator');
  const [roomWidth, setRoomWidth] = useState('');
  const [roomLength, setRoomLength] = useState('');
  const [tileWidth, setTileWidth] = useState('');
  const [tileLength, setTileLength] = useState('');
  const [wastePercent, setWastePercent] = useState(String(DEFAULT_WASTE));
  const [tilesPerBox, setTilesPerBox] = useState(String(DEFAULT_TILES_PER_BOX));

  const result = useMemo(() => {
    const roomW = toNumber(roomWidth);
    const roomL = toNumber(roomLength);
    const tileW = toNumber(tileWidth);
    const tileL = toNumber(tileLength);
    const waste = toNumber(wastePercent);
    const perBox = toNumber(tilesPerBox);

    const roomArea = roomW * roomL;
    const tileArea = tileW > 0 && tileL > 0 ? (tileW / 100) * (tileL / 100) : 0;
    const baseTiles = tileArea > 0 ? roomArea / tileArea : 0;
    const totalTiles = baseTiles * (1 + waste / 100);
    const boxes = perBox > 0 ? Math.ceil(totalTiles / perBox) : 0;

    return {
      roomArea,
      tileArea,
      totalTiles,
      boxes,
    };
  }, [roomWidth, roomLength, tileWidth, tileLength, wastePercent, tilesPerBox]);

  const reset = () => {
    setRoomWidth('');
    setRoomLength('');
    setTileWidth('');
    setTileLength('');
    setWastePercent(String(DEFAULT_WASTE));
    setTilesPerBox(String(DEFAULT_TILES_PER_BOX));
  };

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('roomWidthLabel')}</span>
            <Input
              type="number"
              min={0}
              step="0.1"
              placeholder={t('roomWidthPlaceholder')}
              value={roomWidth}
              onChange={(event) => setRoomWidth(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('roomLengthLabel')}</span>
            <Input
              type="number"
              min={0}
              step="0.1"
              placeholder={t('roomLengthPlaceholder')}
              value={roomLength}
              onChange={(event) => setRoomLength(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('tileWidthLabel')}</span>
            <Input
              type="number"
              min={0}
              step="1"
              placeholder={t('tileWidthPlaceholder')}
              value={tileWidth}
              onChange={(event) => setTileWidth(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('tileLengthLabel')}</span>
            <Input
              type="number"
              min={0}
              step="1"
              placeholder={t('tileLengthPlaceholder')}
              value={tileLength}
              onChange={(event) => setTileLength(event.target.value)}
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
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('tilesPerBoxLabel')}</span>
            <Input
              type="number"
              min={1}
              step="1"
              value={tilesPerBox}
              onChange={(event) => setTilesPerBox(event.target.value)}
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
          <p className="text-sm font-semibold text-gray-700">{t('roomAreaLabel')}</p>
          <p className="text-lg font-semibold text-gray-800">
            {t('areaValue', { value: result.roomArea.toFixed(2) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('tileAreaLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('areaValue', { value: result.tileArea.toFixed(3) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('totalTilesLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('tilesValue', { value: Math.ceil(result.totalTiles) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('boxesLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('boxesValue', { value: result.boxes })}
          </p>
        </div>
      </section>
    </div>
  );
}
