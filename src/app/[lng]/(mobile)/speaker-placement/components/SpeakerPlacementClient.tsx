'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const DEFAULT_DISTANCE = 2.5;
const DEFAULT_RATIO = 0.83;

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

type SpeakerPlacementClientProps = {
  lng: Language;
};

export default function SpeakerPlacementClient({ lng }: SpeakerPlacementClientProps) {
  const { t } = useTranslation(lng, 'speaker-placement');
  const [listeningDistance, setListeningDistance] = useState(String(DEFAULT_DISTANCE));
  const [ratio, setRatio] = useState(String(DEFAULT_RATIO));

  const result = useMemo(() => {
    const distance = toNumber(listeningDistance);
    const ratioValue = toNumber(ratio);

    const speakerDistance = distance * ratioValue;
    const angle =
      distance > 0 ? ((Math.atan(speakerDistance / 2 / distance) * 180) / Math.PI) * 2 : 0;

    return {
      speakerDistance,
      angle,
    };
  }, [listeningDistance, ratio]);

  const reset = () => {
    setListeningDistance(String(DEFAULT_DISTANCE));
    setRatio(String(DEFAULT_RATIO));
  };

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('distanceLabel')}</span>
            <Input
              type="number"
              min={0}
              step="0.1"
              value={listeningDistance}
              onChange={(event) => setListeningDistance(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('ratioLabel')}</span>
            <Input
              type="number"
              min={0.5}
              step="0.01"
              value={ratio}
              onChange={(event) => setRatio(event.target.value)}
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
          <p className="text-sm font-semibold text-gray-700">{t('speakerDistanceLabel')}</p>
          <p className="text-lg font-semibold text-gray-800">
            {t('meterValue', { value: result.speakerDistance.toFixed(2) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('angleLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('degreeValue', { value: result.angle.toFixed(0) })}
          </p>
        </div>
      </section>
    </div>
  );
}
