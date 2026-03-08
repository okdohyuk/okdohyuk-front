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

type StairCalculatorClientProps = {
  lng: Language;
};

export default function StairCalculatorClient({ lng }: StairCalculatorClientProps) {
  const { t } = useTranslation(lng, 'stair-calculator');
  const [totalRise, setTotalRise] = useState('');
  const [desiredRiser, setDesiredRiser] = useState('17');

  const result = useMemo(() => {
    const rise = toNumber(totalRise);
    const riser = toNumber(desiredRiser);

    const steps = riser > 0 ? Math.round(rise / riser) : 0;
    const actualRiser = steps > 0 ? rise / steps : 0;

    return {
      steps,
      actualRiser,
    };
  }, [totalRise, desiredRiser]);

  const reset = () => {
    setTotalRise('');
    setDesiredRiser('17');
  };

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('totalRiseLabel')}</span>
            <Input
              type="number"
              min={0}
              step="1"
              placeholder={t('totalRisePlaceholder')}
              value={totalRise}
              onChange={(event) => setTotalRise(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('desiredRiserLabel')}</span>
            <Input
              type="number"
              min={10}
              step="0.5"
              value={desiredRiser}
              onChange={(event) => setDesiredRiser(event.target.value)}
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
          <p className="text-sm font-semibold text-gray-700">{t('stepsLabel')}</p>
          <p className="text-lg font-semibold text-gray-800">
            {t('stepsValue', { value: result.steps })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('actualRiserLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('cmValue', { value: result.actualRiser.toFixed(1) })}
          </p>
        </div>
      </section>
    </div>
  );
}
