'use client';

import React, { useMemo, useState } from 'react';
import { Coffee } from 'lucide-react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { cn } from '@utils/cn';
import ServiceInfoNotice from '@components/complex/Service/ServiceInfoNotice';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

interface CoffeeRatioClientProps {
  lng: Language;
}

const PRESET_RATIOS = [15, 16, 17];

const toNumber = (value: string) => {
  const numeric = Number.parseFloat(value);
  return Number.isNaN(numeric) ? 0 : numeric;
};

export default function CoffeeRatioClient({ lng }: CoffeeRatioClientProps) {
  const { t } = useTranslation(lng, 'coffee-ratio');
  const [coffee, setCoffee] = useState('20');
  const [ratio, setRatio] = useState('15');

  const water = useMemo(() => {
    const coffeeValue = toNumber(coffee);
    const ratioValue = toNumber(ratio);
    if (!coffeeValue || !ratioValue) return 0;
    return coffeeValue * ratioValue;
  }, [coffee, ratio]);

  return (
    <div className="w-full space-y-6">
      <ServiceInfoNotice icon={<Coffee className="h-5 w-5" />}>{t('notice')}</ServiceInfoNotice>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <label
            htmlFor="coffee-dose"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.coffee')}
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="coffee-dose"
              type="number"
              min="0"
              step="0.1"
              inputMode="decimal"
              placeholder={t('placeholder.coffee')}
              value={coffee}
              onChange={(event) => setCoffee(event.target.value)}
            />
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              {t('unit.gram')}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="brew-ratio"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.ratio')}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              id="brew-ratio"
              type="number"
              min="1"
              step="0.1"
              inputMode="decimal"
              placeholder={t('placeholder.ratio')}
              value={ratio}
              onChange={(event) => setRatio(event.target.value)}
              className="max-w-[140px]"
            />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t('helper.ratio')}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_RATIOS.map((preset) => (
              <Button
                key={preset}
                type="button"
                className="px-3 py-1 text-xs"
                onClick={() => setRatio(String(preset))}
              >
                1:{preset}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-2 p-4')}>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('label.water')}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {water ? water.toLocaleString() : '0'} {t('unit.gram')}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('resultNote')}</p>
      </div>
    </div>
  );
}
