'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

type ShelfSpacingClientProps = {
  lng: Language;
};

export default function ShelfSpacingClient({ lng }: ShelfSpacingClientProps) {
  const { t } = useTranslation(lng, 'shelf-spacing');
  const [totalHeight, setTotalHeight] = useState('');
  const [shelves, setShelves] = useState('5');
  const [thickness, setThickness] = useState('1.8');

  const result = useMemo(() => {
    const height = toNumber(totalHeight);
    const shelfCount = Math.max(1, Math.round(toNumber(shelves)));
    const thicknessValue = toNumber(thickness);

    const usableHeight = height - thicknessValue * shelfCount;
    const gap = shelfCount > 1 ? usableHeight / (shelfCount - 1) : usableHeight;

    return {
      usableHeight,
      gap,
      shelfCount,
    };
  }, [totalHeight, shelves, thickness]);

  const reset = () => {
    setTotalHeight('');
    setShelves('5');
    setThickness('1.8');
  };

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('heightLabel')}</span>
            <Input
              type="number"
              min={0}
              step="0.1"
              placeholder={t('heightPlaceholder')}
              value={totalHeight}
              onChange={(event) => setTotalHeight(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('shelvesLabel')}</span>
            <Input
              type="number"
              min={1}
              step="1"
              value={shelves}
              onChange={(event) => setShelves(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('thicknessLabel')}</span>
            <Input
              type="number"
              min={0}
              step="0.1"
              value={thickness}
              onChange={(event) => setThickness(event.target.value)}
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
          <p className="text-sm font-semibold text-gray-700">{t('usableHeightLabel')}</p>
          <p className="text-lg font-semibold text-gray-800">
            {t('cmValue', { value: result.usableHeight.toFixed(1) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('gapLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('cmValue', { value: result.gap.toFixed(1) })}
          </p>
        </div>
      </section>
    </div>
  );
}
