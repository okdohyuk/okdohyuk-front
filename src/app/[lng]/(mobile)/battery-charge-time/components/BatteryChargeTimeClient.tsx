'use client';

import React, { useMemo, useState } from 'react';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';

const PRESET_WATTS = [5, 10, 18, 20, 25];
const DEFAULT_VOLTAGE = 3.85;

const parseNumber = (value: string) => {
  const normalized = value.replace(/,/g, '').trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) return null;
  return parsed;
};

type BatteryChargeTimeClientProps = {
  lng: Language;
};

export default function BatteryChargeTimeClient({ lng }: BatteryChargeTimeClientProps) {
  const { t } = useTranslation(lng, 'battery-charge-time');
  const [capacity, setCapacity] = useState('4500');
  const [chargerPower, setChargerPower] = useState('20');
  const [efficiency, setEfficiency] = useState('85');
  const [batteryVoltage, setBatteryVoltage] = useState(String(DEFAULT_VOLTAGE));
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const capacityMah = parseNumber(capacity);
    const chargerW = parseNumber(chargerPower);
    const efficiencyPercent = parseNumber(efficiency);
    const voltage = parseNumber(batteryVoltage);

    if (!capacityMah || !chargerW || !efficiencyPercent || !voltage) {
      return null;
    }

    const clampedEfficiency = Math.min(Math.max(efficiencyPercent, 1), 100);
    const batteryWh = (capacityMah / 1000) * voltage;
    const effectivePower = chargerW * (clampedEfficiency / 100);

    if (effectivePower <= 0) return null;

    const hours = batteryWh / effectivePower;
    const totalMinutes = Math.round(hours * 60);
    const displayHours = Math.floor(totalMinutes / 60);
    const displayMinutes = totalMinutes % 60;

    return {
      hours,
      displayHours,
      displayMinutes,
      batteryWh,
      clampedEfficiency,
    };
  }, [capacity, chargerPower, efficiency, batteryVoltage]);

  const summary = useMemo(() => {
    if (!result) return '';
    return t('summary', {
      capacity,
      chargerPower,
      efficiency: result.clampedEfficiency,
      hours: result.displayHours,
      minutes: result.displayMinutes,
    });
  }, [capacity, chargerPower, result, t]);

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleClear = () => {
    setCapacity('');
    setChargerPower('');
    setEfficiency('85');
    setBatteryVoltage(String(DEFAULT_VOLTAGE));
  };

  const handleExample = () => {
    setCapacity('4500');
    setChargerPower('20');
    setEfficiency('85');
    setBatteryVoltage(String(DEFAULT_VOLTAGE));
  };

  return (
    <div className="space-y-4">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <Text className="text-sm text-gray-400">{t('capacityLabel')}</Text>
          <Input
            inputMode="numeric"
            placeholder={t('capacityPlaceholder')}
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
          />
          <Text className="text-xs text-gray-500">{t('capacityHint')}</Text>
        </div>
        <div className="space-y-2">
          <Text className="text-sm text-gray-400">{t('chargerPowerLabel')}</Text>
          <Input
            inputMode="numeric"
            placeholder={t('chargerPowerPlaceholder')}
            value={chargerPower}
            onChange={(event) => setChargerPower(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {PRESET_WATTS.map((preset) => (
              <Button
                key={preset}
                type="button"
                className="h-8 px-3 text-xs"
                onClick={() => setChargerPower(String(preset))}
              >
                {preset}W
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Text className="text-sm text-gray-400">{t('efficiencyLabel')}</Text>
            <Input
              inputMode="numeric"
              placeholder={t('efficiencyPlaceholder')}
              value={efficiency}
              onChange={(event) => setEfficiency(event.target.value)}
            />
            <Text className="text-xs text-gray-500">{t('efficiencyHint')}</Text>
          </div>
          <div className="space-y-2">
            <Text className="text-sm text-gray-400">{t('voltageLabel')}</Text>
            <Input
              inputMode="numeric"
              placeholder={t('voltagePlaceholder')}
              value={batteryVoltage}
              onChange={(event) => setBatteryVoltage(event.target.value)}
            />
            <Text className="text-xs text-gray-500">{t('voltageHint')}</Text>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" className="h-9 px-4 text-sm" onClick={handleExample}>
            {t('applyExample')}
          </Button>
          <Button type="button" className="h-9 px-4 text-sm" onClick={handleClear}>
            {t('clear')}
          </Button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text className="text-base font-semibold">{t('resultTitle')}</Text>
        {result ? (
          <div className="space-y-2">
            <Text className="text-2xl font-semibold">
              {t('resultValue', {
                hours: result.displayHours,
                minutes: result.displayMinutes,
              })}
            </Text>
            <Text className="text-sm text-gray-400">
              {t('resultDetail', {
                hours: result.hours.toFixed(2),
                wh: result.batteryWh.toFixed(1),
              })}
            </Text>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" className="h-9 px-4 text-sm" onClick={handleCopy}>
                {copied ? t('copied') : t('copySummary')}
              </Button>
              <Text className="text-xs text-gray-500">{t('copyHint')}</Text>
            </div>
          </div>
        ) : (
          <Text className="text-sm text-gray-500">{t('resultEmpty')}</Text>
        )}
      </section>
    </div>
  );
}
