'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import GoogleAd from '@components/google/GoogleAd';
import { useToolTracking } from '@hooks/analytics/useToolTracking';

const DEFAULT_WEEKS = 4.3;
const DEFAULT_DAYS = 5;

const numberOrZero = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

type CommuteCostClientProps = {
  lng: Language;
};

export default function CommuteCostClient({ lng }: CommuteCostClientProps) {
  const { t } = useTranslation(lng, 'commute-cost');
  const { trackInputStarted, trackUse } = useToolTracking('commute-cost', 'calculator');
  const [roundTrip, setRoundTrip] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState(String(DEFAULT_DAYS));
  const [weeksPerMonth, setWeeksPerMonth] = useState(String(DEFAULT_WEEKS));
  const [monthlyPass, setMonthlyPass] = useState('');
  const lastTrackedKeyRef = useRef<string | null>(null);

  const values = useMemo(() => {
    const roundTripValue = numberOrZero(roundTrip);
    const daysValue = numberOrZero(daysPerWeek);
    const weeksValue = numberOrZero(weeksPerMonth);
    const monthlyPassValue = numberOrZero(monthlyPass);

    const monthlyCost = roundTripValue * daysValue * weeksValue;
    const monthlyWithPass = monthlyPassValue > 0 ? monthlyPassValue : monthlyCost;
    const annualCost = monthlyWithPass * 12;
    const dailyAverage = daysValue > 0 ? monthlyWithPass / (daysValue * weeksValue) : 0;

    return {
      monthlyCost,
      monthlyWithPass,
      annualCost,
      dailyAverage,
    };
  }, [roundTrip, daysPerWeek, weeksPerMonth, monthlyPass]);

  useEffect(() => {
    if (roundTrip && values.monthlyCost > 0) {
      const key = `${roundTrip}|${daysPerWeek}|${weeksPerMonth}|${monthlyPass}`;
      if (lastTrackedKeyRef.current !== key) {
        lastTrackedKeyRef.current = key;
        trackUse({ action_type: 'calculate', success: true, monthly_cost: values.monthlyWithPass });
      }
    }
  }, [roundTrip, daysPerWeek, weeksPerMonth, monthlyPass, values, trackUse]);

  const reset = () => {
    setRoundTrip('');
    setDaysPerWeek(String(DEFAULT_DAYS));
    setWeeksPerMonth(String(DEFAULT_WEEKS));
    setMonthlyPass('');
  };

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-fg-3">{t('roundTripLabel')}</span>
            <Input
              type="number"
              min={0}
              step="100"
              placeholder={t('roundTripPlaceholder')}
              value={roundTrip}
              onChange={(event) => {
                trackInputStarted();
                setRoundTrip(event.target.value);
              }}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-fg-3">{t('daysLabel')}</span>
            <Input
              type="number"
              min={1}
              max={7}
              step="1"
              value={daysPerWeek}
              onChange={(event) => {
                trackInputStarted();
                setDaysPerWeek(event.target.value);
              }}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-fg-3">{t('weeksLabel')}</span>
            <Input
              type="number"
              min={1}
              step="0.1"
              value={weeksPerMonth}
              onChange={(event) => {
                trackInputStarted();
                setWeeksPerMonth(event.target.value);
              }}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-fg-3">{t('passLabel')}</span>
            <Input
              type="number"
              min={0}
              step="1000"
              placeholder={t('passPlaceholder')}
              value={monthlyPass}
              onChange={(event) => {
                trackInputStarted();
                setMonthlyPass(event.target.value);
              }}
            />
          </div>
        </div>

        <p className="text-xs text-fg-5">{t('tips')}</p>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={reset} className="px-4 bg-basic-2 text-fg-3">
            {t('reset')}
          </Button>
        </div>
      </section>

      {roundTrip && <GoogleAd slotId="7911066601" className="w-full mt-4" />}

      <section className={`${SERVICE_PANEL_SOFT} space-y-3 p-4`}>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-fg-3">{t('monthlyCostLabel')}</p>
          <p className="text-lg font-semibold text-fg-2">
            {t('currency', { value: values.monthlyCost.toFixed(0) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-fg-3">{t('passCostLabel')}</p>
          <p className="text-lg font-semibold text-fg-2">
            {t('currency', { value: values.monthlyWithPass.toFixed(0) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-fg-3">{t('dailyAverageLabel')}</p>
          <p className="text-base font-medium text-fg-3">
            {t('currency', { value: values.dailyAverage.toFixed(0) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-fg-3">{t('annualCostLabel')}</p>
          <p className="text-base font-medium text-fg-3">
            {t('currency', { value: values.annualCost.toFixed(0) })}
          </p>
        </div>
      </section>
    </div>
  );
}
