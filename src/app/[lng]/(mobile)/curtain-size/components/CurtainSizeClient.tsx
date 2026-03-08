'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const DEFAULT_FULLNESS = 2;
const DEFAULT_PANELS = 2;
const DEFAULT_HEM = 15;
const DEFAULT_TOP = 10;

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

type CurtainSizeClientProps = {
  lng: Language;
};

export default function CurtainSizeClient({ lng }: CurtainSizeClientProps) {
  const { t } = useTranslation(lng, 'curtain-size');
  const [windowWidth, setWindowWidth] = useState('');
  const [windowHeight, setWindowHeight] = useState('');
  const [fullness, setFullness] = useState(String(DEFAULT_FULLNESS));
  const [panels, setPanels] = useState(String(DEFAULT_PANELS));
  const [hem, setHem] = useState(String(DEFAULT_HEM));
  const [top, setTop] = useState(String(DEFAULT_TOP));

  const result = useMemo(() => {
    const width = toNumber(windowWidth);
    const height = toNumber(windowHeight);
    const fullnessValue = toNumber(fullness);
    const panelCount = toNumber(panels);
    const hemValue = toNumber(hem);
    const topValue = toNumber(top);

    const totalWidth = width * Math.max(fullnessValue, 1);
    const panelWidth = panelCount > 0 ? totalWidth / panelCount : 0;
    const finishedLength = height + hemValue + topValue;

    return {
      totalWidth,
      panelWidth,
      finishedLength,
    };
  }, [windowWidth, windowHeight, fullness, panels, hem, top]);

  const reset = () => {
    setWindowWidth('');
    setWindowHeight('');
    setFullness(String(DEFAULT_FULLNESS));
    setPanels(String(DEFAULT_PANELS));
    setHem(String(DEFAULT_HEM));
    setTop(String(DEFAULT_TOP));
  };

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('windowWidthLabel')}</span>
            <Input
              type="number"
              min={0}
              step="0.5"
              placeholder={t('windowWidthPlaceholder')}
              value={windowWidth}
              onChange={(event) => setWindowWidth(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('windowHeightLabel')}</span>
            <Input
              type="number"
              min={0}
              step="0.5"
              placeholder={t('windowHeightPlaceholder')}
              value={windowHeight}
              onChange={(event) => setWindowHeight(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('fullnessLabel')}</span>
            <Input
              type="number"
              min={1}
              step="0.1"
              value={fullness}
              onChange={(event) => setFullness(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('panelsLabel')}</span>
            <Input
              type="number"
              min={1}
              step="1"
              value={panels}
              onChange={(event) => setPanels(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('hemLabel')}</span>
            <Input
              type="number"
              min={0}
              step="1"
              value={hem}
              onChange={(event) => setHem(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('topLabel')}</span>
            <Input
              type="number"
              min={0}
              step="1"
              value={top}
              onChange={(event) => setTop(event.target.value)}
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
          <p className="text-sm font-semibold text-gray-700">{t('totalWidthLabel')}</p>
          <p className="text-lg font-semibold text-gray-800">
            {t('cmValue', { value: result.totalWidth.toFixed(1) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('panelWidthLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('cmValue', { value: result.panelWidth.toFixed(1) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('lengthLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('cmValue', { value: result.finishedLength.toFixed(1) })}
          </p>
        </div>
      </section>
    </div>
  );
}
