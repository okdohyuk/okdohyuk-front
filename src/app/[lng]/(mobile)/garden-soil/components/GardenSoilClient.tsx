'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const DEFAULT_DEPTH = 15;
const DEFAULT_BAG_VOLUME = 20;

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

type GardenSoilClientProps = {
  lng: Language;
};

export default function GardenSoilClient({ lng }: GardenSoilClientProps) {
  const { t } = useTranslation(lng, 'garden-soil');
  const [area, setArea] = useState('');
  const [depth, setDepth] = useState(String(DEFAULT_DEPTH));
  const [bagVolume, setBagVolume] = useState(String(DEFAULT_BAG_VOLUME));

  const result = useMemo(() => {
    const areaValue = toNumber(area);
    const depthValue = toNumber(depth);
    const bagValue = toNumber(bagVolume);

    const volumeLiters = areaValue * (depthValue / 100) * 1000;
    const bags = bagValue > 0 ? Math.ceil(volumeLiters / bagValue) : 0;

    return {
      volumeLiters,
      bags,
    };
  }, [area, depth, bagVolume]);

  const reset = () => {
    setArea('');
    setDepth(String(DEFAULT_DEPTH));
    setBagVolume(String(DEFAULT_BAG_VOLUME));
  };

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('areaLabel')}</span>
            <Input
              type="number"
              min={0}
              step="0.1"
              placeholder={t('areaPlaceholder')}
              value={area}
              onChange={(event) => setArea(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('depthLabel')}</span>
            <Input
              type="number"
              min={1}
              step="1"
              value={depth}
              onChange={(event) => setDepth(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('bagLabel')}</span>
            <Input
              type="number"
              min={1}
              step="1"
              value={bagVolume}
              onChange={(event) => setBagVolume(event.target.value)}
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
          <p className="text-sm font-semibold text-gray-700">{t('volumeLabel')}</p>
          <p className="text-lg font-semibold text-gray-800">
            {t('literValue', { value: result.volumeLiters.toFixed(1) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('bagsLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('bagsValue', { value: result.bags })}
          </p>
        </div>
      </section>
    </div>
  );
}
