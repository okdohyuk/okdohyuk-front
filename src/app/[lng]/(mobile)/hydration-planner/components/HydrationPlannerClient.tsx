'use client';

import React, { useMemo, useState } from 'react';
import { Droplets, Timer, Sun } from 'lucide-react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { SERVICE_PANEL, SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const activityOptions = ['low', 'moderate', 'high'] as const;

type ActivityLevel = (typeof activityOptions)[number];

type HydrationPlannerClientProps = {
  lng: Language;
};

const parseTimeToMinutes = (value: string) => {
  const [hour, minute] = value.split(':').map((item) => Number(item));
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return Math.min(23, Math.max(0, hour)) * 60 + Math.min(59, Math.max(0, minute));
};

const formatMinutesToTime = (totalMinutes: number) => {
  const minutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

function HydrationPlannerClient({ lng }: HydrationPlannerClientProps) {
  const { t } = useTranslation(lng, 'hydration-planner');
  const [weight, setWeight] = useState(65);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [bottleSize, setBottleSize] = useState(500);

  const result = useMemo(() => {
    const safeWeight = Number.isFinite(weight) ? Math.max(30, weight) : 30;
    const safeBottle = Number.isFinite(bottleSize) ? Math.max(150, bottleSize) : 500;

    const activityBonus = {
      low: 0,
      moderate: 300,
      high: 600,
    }[activityLevel];

    const baseMl = safeWeight * 30;
    const totalMl = Math.max(1200, Math.round(baseMl + activityBonus));
    const bottleCount = Math.max(1, Math.ceil(totalMl / safeBottle));

    const wakeMinutes = parseTimeToMinutes(wakeTime) ?? 420;
    const sleepMinutes = parseTimeToMinutes(sleepTime) ?? 1380;
    const awakeMinutes =
      sleepMinutes >= wakeMinutes ? sleepMinutes - wakeMinutes : 1440 - wakeMinutes + sleepMinutes;

    const intervalMinutes = Math.max(30, Math.floor(awakeMinutes / bottleCount));
    const scheduleCount = Math.min(12, bottleCount);
    const scheduleInterval = Math.max(30, Math.floor(awakeMinutes / scheduleCount));

    const schedule = Array.from({ length: scheduleCount }, (_, index) =>
      formatMinutesToTime(wakeMinutes + scheduleInterval * index),
    );

    return {
      totalMl,
      bottleCount,
      perBottleMl: safeBottle,
      intervalMinutes,
      awakeMinutes,
      schedule,
      scheduleCount,
    };
  }, [weight, activityLevel, wakeTime, sleepTime, bottleSize]);

  const awakeHours = (result.awakeMinutes / 60).toFixed(1);
  const liters = (result.totalMl / 1000).toFixed(1);

  return (
    <section className="space-y-4">
      <div className={`${SERVICE_PANEL} space-y-4 p-4`}>
        <div className="flex items-center gap-2">
          <Droplets className="text-point-2" />
          <h3 className="t-basic-1 font-semibold">{t('inputs.title')}</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="t-d-1 t-basic-0" htmlFor="hydration-weight">
              {t('inputs.weightLabel')}
            </label>
            <Input
              id="hydration-weight"
              type="number"
              min={30}
              value={weight}
              onChange={(event) => setWeight(Number(event.target.value))}
              placeholder={t('inputs.weightPlaceholder')}
            />
            <p className="t-d-2 t-basic-2">{t('inputs.weightHint')}</p>
          </div>

          <div className="space-y-2">
            <label className="t-d-1 t-basic-0" htmlFor="hydration-activity">
              {t('inputs.activityLabel')}
            </label>
            <Select
              value={activityLevel}
              onValueChange={(value) => setActivityLevel(value as ActivityLevel)}
            >
              <SelectTrigger id="hydration-activity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activityOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {t(`activity.${option}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="t-d-2 t-basic-2">{t('inputs.activityHint')}</p>
          </div>

          <div className="space-y-2">
            <label className="t-d-1 t-basic-0" htmlFor="hydration-wake">
              {t('inputs.wakeLabel')}
            </label>
            <Input
              id="hydration-wake"
              type="time"
              value={wakeTime}
              onChange={(event) => setWakeTime(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="t-d-1 t-basic-0" htmlFor="hydration-sleep">
              {t('inputs.sleepLabel')}
            </label>
            <Input
              id="hydration-sleep"
              type="time"
              value={sleepTime}
              onChange={(event) => setSleepTime(event.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="t-d-1 t-basic-0" htmlFor="hydration-bottle">
              {t('inputs.bottleLabel')}
            </label>
            <Input
              id="hydration-bottle"
              type="number"
              min={150}
              step={10}
              value={bottleSize}
              onChange={(event) => setBottleSize(Number(event.target.value))}
              placeholder={t('inputs.bottlePlaceholder')}
            />
          </div>
        </div>
      </div>

      <div className={`${SERVICE_PANEL} space-y-4 p-4`}>
        <div className="flex items-center gap-2">
          <Timer className="text-point-2" />
          <h3 className="t-basic-1 font-semibold">{t('results.title')}</h3>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className={`${SERVICE_PANEL_SOFT} space-y-1 p-3`}>
            <p className="t-d-2 t-basic-2">{t('results.dailyGoal')}</p>
            <p className="t-basic-1 font-semibold">
              {liters} {t('units.liters')}
            </p>
            <p className="t-d-2 t-basic-2">
              {result.totalMl} {t('units.ml')}
            </p>
          </div>
          <div className={`${SERVICE_PANEL_SOFT} space-y-1 p-3`}>
            <p className="t-d-2 t-basic-2">{t('results.bottleCount')}</p>
            <p className="t-basic-1 font-semibold">{result.bottleCount}</p>
          </div>
          <div className={`${SERVICE_PANEL_SOFT} space-y-1 p-3`}>
            <p className="t-d-2 t-basic-2">{t('results.perBottle')}</p>
            <p className="t-basic-1 font-semibold">
              {result.perBottleMl} {t('units.ml')}
            </p>
          </div>
          <div className={`${SERVICE_PANEL_SOFT} space-y-1 p-3`}>
            <p className="t-d-2 t-basic-2">{t('results.interval')}</p>
            <p className="t-basic-1 font-semibold">
              {result.intervalMinutes} {t('units.minutes')}
            </p>
          </div>
        </div>

        <div className={`${SERVICE_PANEL_SOFT} space-y-2 p-3`}>
          <div className="flex items-center gap-2">
            <Sun className="text-point-2" />
            <p className="t-d-1 t-basic-1">{t('results.awakeHours')}</p>
          </div>
          <p className="t-basic-1 font-semibold">
            {awakeHours} {t('units.hours')}
          </p>
          <p className="t-d-2 t-basic-2">{t('results.schedule')}</p>
          <div className="flex flex-wrap gap-2">
            {result.schedule.map((time) => (
              <span key={time} className="rounded-full bg-point-4 px-3 py-1 text-sm text-point-1">
                {time}
              </span>
            ))}
          </div>
          {result.scheduleCount < result.bottleCount ? (
            <p className="t-d-2 t-basic-2">
              {t('results.scheduleNote', {
                total: result.bottleCount,
                shown: result.scheduleCount,
              })}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default HydrationPlannerClient;
