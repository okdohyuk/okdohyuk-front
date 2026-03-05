'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const DEFAULT_MARGIN = 20;

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

type LedStripPowerClientProps = {
  lng: Language;
};

export default function LedStripPowerClient({ lng }: LedStripPowerClientProps) {
  const { t } = useTranslation(lng, 'led-strip-power');
  const [length, setLength] = useState('');
  const [powerPerMeter, setPowerPerMeter] = useState('');
  const [voltage, setVoltage] = useState('12');
  const [margin, setMargin] = useState(String(DEFAULT_MARGIN));

  const result = useMemo(() => {
    const lengthValue = toNumber(length);
    const powerValue = toNumber(powerPerMeter);
    const voltageValue = toNumber(voltage);
    const marginValue = toNumber(margin);

    const basePower = lengthValue * powerValue;
    const recommendedPower = basePower * (1 + marginValue / 100);
    const current = voltageValue > 0 ? recommendedPower / voltageValue : 0;

    return {
      basePower,
      recommendedPower,
      current,
    };
  }, [length, powerPerMeter, voltage, margin]);

  const reset = () => {
    setLength('');
    setPowerPerMeter('');
    setVoltage('12');
    setMargin(String(DEFAULT_MARGIN));
  };

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('lengthLabel')}</span>
            <Input
              type="number"
              min={0}
              step="0.1"
              placeholder={t('lengthPlaceholder')}
              value={length}
              onChange={(event) => setLength(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('powerLabel')}</span>
            <Input
              type="number"
              min={0}
              step="0.1"
              placeholder={t('powerPlaceholder')}
              value={powerPerMeter}
              onChange={(event) => setPowerPerMeter(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('voltageLabel')}</span>
            <Input
              type="number"
              min={1}
              step="1"
              value={voltage}
              onChange={(event) => setVoltage(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('marginLabel')}</span>
            <Input
              type="number"
              min={0}
              step="1"
              value={margin}
              onChange={(event) => setMargin(event.target.value)}
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
          <p className="text-sm font-semibold text-gray-700">{t('basePowerLabel')}</p>
          <p className="text-lg font-semibold text-gray-800">
            {t('wattValue', { value: result.basePower.toFixed(1) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('recommendedPowerLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('wattValue', { value: result.recommendedPower.toFixed(1) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('currentLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('ampValue', { value: result.current.toFixed(2) })}
          </p>
        </div>
      </section>
    </div>
  );
}
