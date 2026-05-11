'use client';

import React from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Input } from '@components/basic/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { SERVICE_PANEL, SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import GoogleAd from '@components/google/GoogleAd';
import { cn } from '@utils/cn';
import { useToolTracking } from '@hooks/analytics/useToolTracking';
import type { Language } from '~/app/i18n/settings';

const localeMap: Record<Language, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

const toNumber = (value: string) => {
  if (!value) return null;
  const normalized = value.replace(/,/g, '').trim();
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
};

const formatNumber = (language: Language, value: number, fractionDigits = 1) => {
  return new Intl.NumberFormat(localeMap[language], {
    maximumFractionDigits: fractionDigits,
  }).format(value);
};

type ActivityLevel = 'low' | 'medium' | 'high';
type ClimateLevel = 'cool' | 'normal' | 'hot';

type Props = {
  lng: Language;
};

export default function WaterIntakeClient({ lng }: Props) {
  const { t } = useTranslation(lng, 'water-intake');
  const { trackInputStarted, trackUse } = useToolTracking('water-intake', 'calculator');
  const [weight, setWeight] = React.useState('');
  const [activity, setActivity] = React.useState<ActivityLevel>('medium');
  const [climate, setClimate] = React.useState<ClimateLevel>('normal');
  const lastTrackedKeyRef = React.useRef<string | null>(null);

  const weightValue = toNumber(weight);

  const result = React.useMemo(() => {
    if (!weightValue) return null;
    const base = weightValue * 30;
    const activityBoost = {
      low: 0,
      medium: 350,
      high: 700,
    } satisfies Record<ActivityLevel, number>;
    const climateBoost = {
      cool: -200,
      normal: 0,
      hot: 400,
    } satisfies Record<ClimateLevel, number>;

    const totalMl = Math.max(1200, base + activityBoost[activity] + climateBoost[climate]);
    const liters = totalMl / 1000;
    const cups = totalMl / 250;
    const bottles = totalMl / 500;

    return { totalMl, liters, cups, bottles };
  }, [weightValue, activity, climate]);

  React.useEffect(() => {
    if (result) {
      const key = `${weightValue}|${activity}|${climate}`;
      if (lastTrackedKeyRef.current !== key) {
        lastTrackedKeyRef.current = key;
        trackUse({
          action_type: 'calculate',
          success: true,
          total_ml: result.totalMl,
        });
      }
    }
  }, [result, weightValue, activity, climate, trackUse]);

  const tips = t('tips.items', { returnObjects: true }) as string[];

  return (
    <div className="space-y-4">
      <section className={cn(SERVICE_PANEL, 'p-4 space-y-3')}>
        <header className="space-y-1">
          <h3 className="text-base font-bold text-fg-1">{t('inputs.title')}</h3>
          <p className="text-xs text-fg-5">{t('inputs.description')}</p>
        </header>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => {
              trackInputStarted();
              setWeight(e.target.value);
            }}
            placeholder={t('inputs.weightPlaceholder')}
            className="text-sm"
          />
          <Select
            value={activity}
            onValueChange={(value) => {
              trackInputStarted();
              setActivity(value as ActivityLevel);
            }}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder={t('inputs.activity')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">{t('activity.low')}</SelectItem>
              <SelectItem value="medium">{t('activity.medium')}</SelectItem>
              <SelectItem value="high">{t('activity.high')}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={climate}
            onValueChange={(value) => {
              trackInputStarted();
              setClimate(value as ClimateLevel);
            }}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder={t('inputs.climate')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cool">{t('climate.cool')}</SelectItem>
              <SelectItem value="normal">{t('climate.normal')}</SelectItem>
              <SelectItem value="hot">{t('climate.hot')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className={cn(SERVICE_PANEL_SOFT, 'p-3 text-sm text-fg-3')}>
          {result ? (
            <div className="space-y-1">
              <p className="font-semibold text-fg-1">
                {t('result.dailyTarget', {
                  amount: formatNumber(lng, result.liters, 2),
                })}
              </p>
              <p>
                {t('result.cups', {
                  amount: formatNumber(lng, result.cups, 1),
                })}
              </p>
              <p>
                {t('result.bottles', {
                  amount: formatNumber(lng, result.bottles, 1),
                })}
              </p>
            </div>
          ) : (
            <span className="text-fg-6">{t('result.empty')}</span>
          )}
        </div>
      </section>

      {result && <GoogleAd slotId="7911066601" className="w-full mt-4" />}

      <section className={cn(SERVICE_PANEL, 'p-4 space-y-3')}>
        <header className="space-y-1">
          <h3 className="text-base font-bold text-fg-1">{t('tips.title')}</h3>
          <p className="text-xs text-fg-5">{t('tips.description')}</p>
        </header>
        <ul className="list-disc space-y-2 pl-5 text-sm text-fg-3">
          {tips.map((item, index) => (
            <li key={`tip-${index.toString()}`}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
