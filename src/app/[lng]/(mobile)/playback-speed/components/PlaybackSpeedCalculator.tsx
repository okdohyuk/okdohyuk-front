'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { Text } from '@components/basic/Text';
import { H2, H3 } from '@components/basic/Text/Headers';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { TimeParts, formatTime, sanitizeNumberInput, toSeconds } from '../utils/time';

const defaultTime: TimeParts = {
  hours: '',
  minutes: '',
  seconds: '',
};

const speedPresets = ['1', '1.25', '1.5', '2'];

type PlaybackSpeedCalculatorProps = {
  lng: Language;
};

function PlaybackSpeedCalculator({ lng }: PlaybackSpeedCalculatorProps) {
  const { t } = useTranslation(lng, 'playback-speed');
  const [originalTime, setOriginalTime] = useState<TimeParts>(defaultTime);
  const [targetTime, setTargetTime] = useState<TimeParts>(defaultTime);
  const [speed, setSpeed] = useState('1');

  const originalSeconds = useMemo(() => toSeconds(originalTime), [originalTime]);
  const targetSeconds = useMemo(() => toSeconds(targetTime), [targetTime]);

  const speedValue = useMemo(() => Number(speed), [speed]);
  const adjustedSeconds = useMemo(() => {
    if (!originalSeconds || !speedValue || speedValue <= 0) return null;
    return originalSeconds / speedValue;
  }, [originalSeconds, speedValue]);

  const requiredSpeed = useMemo(() => {
    if (!originalSeconds || !targetSeconds) return null;
    return originalSeconds / targetSeconds;
  }, [originalSeconds, targetSeconds]);

  const handleTimeChange = (
    updater: React.Dispatch<React.SetStateAction<TimeParts>>,
    field: keyof TimeParts,
    max?: number,
  ) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      updater((prev) => ({
        ...prev,
        [field]: sanitizeNumberInput(event.target.value, max),
      }));
    };
  };

  const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9.]/g, '');
    const normalized = value.startsWith('.') ? `0${value}` : value;
    const parts = normalized.split('.');
    const safe = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : normalized;
    setSpeed(safe);
  };

  const copyText = async (value: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
  };

  const resetAll = () => {
    setOriginalTime(defaultTime);
    setTargetTime(defaultTime);
    setSpeed('1');
  };

  const displayAdjusted = adjustedSeconds ? formatTime(adjustedSeconds) : '-';
  const displayRequiredSpeed = requiredSpeed ? `${requiredSpeed.toFixed(2)}x` : '-';

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="space-y-2">
          <H2>{t('section.adjusted')}</H2>
          <Text variant="d2" color="basic-4">
            {t('section.adjustedDescription')}
          </Text>
        </div>
        <div className="mt-4 grid gap-4">
          <div>
            <H3 className="mb-2">{t('label.originalDuration')}</H3>
            <div className="grid grid-cols-3 gap-2">
              <Input
                inputMode="numeric"
                placeholder={t('unit.hours')}
                value={originalTime.hours}
                onChange={handleTimeChange(setOriginalTime, 'hours')}
              />
              <Input
                inputMode="numeric"
                placeholder={t('unit.minutes')}
                value={originalTime.minutes}
                onChange={handleTimeChange(setOriginalTime, 'minutes', 59)}
              />
              <Input
                inputMode="numeric"
                placeholder={t('unit.seconds')}
                value={originalTime.seconds}
                onChange={handleTimeChange(setOriginalTime, 'seconds', 59)}
              />
            </div>
          </div>
          <div>
            <H3 className="mb-2">{t('label.speed')}</H3>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="text"
                inputMode="decimal"
                value={speed}
                onChange={handleSpeedChange}
                placeholder="1"
                className="max-w-[140px]"
              />
              <div className="flex flex-wrap gap-2">
                {speedPresets.map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant="secondary"
                    onClick={() => setSpeed(preset)}
                    className={cn(
                      'h-8 rounded-full px-3 text-sm',
                      speed === preset && 'border border-point-1',
                    )}
                  >
                    {preset}x
                  </Button>
                ))}
              </div>
            </div>
            <Text variant="c1" color="basic-5" className="mt-2">
              {t('helper.speedRange')}
            </Text>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
            <div className="flex items-center justify-between gap-2">
              <div>
                <Text variant="d2" color="basic-4">
                  {t('label.adjustedResult')}
                </Text>
                <Text variant="t3" className="block">
                  {displayAdjusted}
                </Text>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => copyText(displayAdjusted)}
                disabled={displayAdjusted === '-'}
              >
                {t('button.copyTime')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="space-y-2">
          <H2>{t('section.required')}</H2>
          <Text variant="d2" color="basic-4">
            {t('section.requiredDescription')}
          </Text>
        </div>
        <div className="mt-4 grid gap-4">
          <div>
            <H3 className="mb-2">{t('label.targetDuration')}</H3>
            <div className="grid grid-cols-3 gap-2">
              <Input
                inputMode="numeric"
                placeholder={t('unit.hours')}
                value={targetTime.hours}
                onChange={handleTimeChange(setTargetTime, 'hours')}
              />
              <Input
                inputMode="numeric"
                placeholder={t('unit.minutes')}
                value={targetTime.minutes}
                onChange={handleTimeChange(setTargetTime, 'minutes', 59)}
              />
              <Input
                inputMode="numeric"
                placeholder={t('unit.seconds')}
                value={targetTime.seconds}
                onChange={handleTimeChange(setTargetTime, 'seconds', 59)}
              />
            </div>
            <Text variant="c1" color="basic-5" className="mt-2">
              {t('helper.requiredSpeed')}
            </Text>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
            <div className="flex items-center justify-between gap-2">
              <div>
                <Text variant="d2" color="basic-4">
                  {t('label.requiredSpeed')}
                </Text>
                <Text variant="t3" className="block">
                  {displayRequiredSpeed}
                </Text>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => copyText(displayRequiredSpeed)}
                disabled={displayRequiredSpeed === '-'}
              >
                {t('button.copySpeed')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={resetAll}>
          {t('button.reset')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setOriginalTime({ hours: '1', minutes: '30', seconds: '0' });
            setTargetTime({ hours: '1', minutes: '0', seconds: '0' });
            setSpeed('1.5');
          }}
        >
          {t('button.example')}
        </Button>
      </div>
    </div>
  );
}

export default PlaybackSpeedCalculator;
