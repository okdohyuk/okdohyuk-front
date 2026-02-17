'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@components/basic/Input';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

type CommuteToolkitProps = {
  lng: Language;
};

const toNumber = (value: string) => {
  const parsed = Number(value.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) {
    return '0';
  }
  return value.toLocaleString();
};

export default function CommuteToolkit({ lng }: CommuteToolkitProps) {
  const { t } = useTranslation(lng, 'commute-helper');

  const [minutesPerDay, setMinutesPerDay] = useState('70');
  const [workdays, setWorkdays] = useState('20');
  const [hourlyWage, setHourlyWage] = useState('12000');

  const [distanceOneWay, setDistanceOneWay] = useState('12');
  const [fuelEfficiency, setFuelEfficiency] = useState('12');
  const [fuelPrice, setFuelPrice] = useState('1700');

  const [emissionPerKm, setEmissionPerKm] = useState('120');

  const ids = {
    timeMinutes: 'commute-time-minutes',
    timeWorkdays: 'commute-time-workdays',
    timeHourly: 'commute-time-hourly',
    fuelDistance: 'commute-fuel-distance',
    fuelWorkdays: 'commute-fuel-workdays',
    fuelEfficiency: 'commute-fuel-efficiency',
    fuelPrice: 'commute-fuel-price',
    carbonDistance: 'commute-carbon-distance',
    carbonWorkdays: 'commute-carbon-workdays',
    carbonEmission: 'commute-carbon-emission',
  };

  const timeCost = useMemo(() => {
    const minutes = toNumber(minutesPerDay);
    const days = toNumber(workdays);
    const wage = toNumber(hourlyWage);
    return (minutes / 60) * days * wage;
  }, [minutesPerDay, workdays, hourlyWage]);

  const fuelCost = useMemo(() => {
    const distance = toNumber(distanceOneWay);
    const days = toNumber(workdays);
    const efficiency = toNumber(fuelEfficiency);
    const price = toNumber(fuelPrice);
    if (efficiency <= 0) {
      return 0;
    }
    const totalDistance = distance * 2 * days;
    const liters = totalDistance / efficiency;
    return liters * price;
  }, [distanceOneWay, workdays, fuelEfficiency, fuelPrice]);

  const carbonEmission = useMemo(() => {
    const distance = toNumber(distanceOneWay);
    const days = toNumber(workdays);
    const emission = toNumber(emissionPerKm);
    const totalDistance = distance * 2 * days;
    const grams = totalDistance * emission;
    return grams / 1000;
  }, [distanceOneWay, workdays, emissionPerKm]);

  return (
    <div className="space-y-4">
      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="space-y-1">
          <h3 className="t-d-1 t-basic-1">{t('timeCost.title')}</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('timeCost.description')}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            <label htmlFor={ids.timeMinutes}>{t('timeCost.fields.minutesPerDay')}</label>
            <Input
              id={ids.timeMinutes}
              inputMode="numeric"
              value={minutesPerDay}
              onChange={(event) => setMinutesPerDay(event.target.value)}
              placeholder={t('timeCost.placeholders.minutesPerDay')}
            />
          </div>
          <div className="space-y-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            <label htmlFor={ids.timeWorkdays}>{t('timeCost.fields.workdays')}</label>
            <Input
              id={ids.timeWorkdays}
              inputMode="numeric"
              value={workdays}
              onChange={(event) => setWorkdays(event.target.value)}
              placeholder={t('timeCost.placeholders.workdays')}
            />
          </div>
          <div className="space-y-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            <label htmlFor={ids.timeHourly}>{t('timeCost.fields.hourlyWage')}</label>
            <Input
              id={ids.timeHourly}
              inputMode="numeric"
              value={hourlyWage}
              onChange={(event) => setHourlyWage(event.target.value)}
              placeholder={t('timeCost.placeholders.hourlyWage')}
            />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3 text-sm font-semibold text-zinc-800 shadow-sm dark:bg-zinc-900/50 dark:text-zinc-100">
          <span>{t('timeCost.resultLabel')}</span>
          <span>
            {formatNumber(timeCost)} {t('unit.currency')}
          </span>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="space-y-1">
          <h3 className="t-d-1 t-basic-1">{t('fuelCost.title')}</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('fuelCost.description')}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            <label htmlFor={ids.fuelDistance}>{t('fuelCost.fields.distanceOneWay')}</label>
            <Input
              id={ids.fuelDistance}
              inputMode="numeric"
              value={distanceOneWay}
              onChange={(event) => setDistanceOneWay(event.target.value)}
              placeholder={t('fuelCost.placeholders.distanceOneWay')}
            />
          </div>
          <div className="space-y-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            <label htmlFor={ids.fuelWorkdays}>{t('fuelCost.fields.workdays')}</label>
            <Input
              id={ids.fuelWorkdays}
              inputMode="numeric"
              value={workdays}
              onChange={(event) => setWorkdays(event.target.value)}
              placeholder={t('fuelCost.placeholders.workdays')}
            />
          </div>
          <div className="space-y-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            <label htmlFor={ids.fuelEfficiency}>{t('fuelCost.fields.fuelEfficiency')}</label>
            <Input
              id={ids.fuelEfficiency}
              inputMode="numeric"
              value={fuelEfficiency}
              onChange={(event) => setFuelEfficiency(event.target.value)}
              placeholder={t('fuelCost.placeholders.fuelEfficiency')}
            />
          </div>
          <div className="space-y-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            <label htmlFor={ids.fuelPrice}>{t('fuelCost.fields.fuelPrice')}</label>
            <Input
              id={ids.fuelPrice}
              inputMode="numeric"
              value={fuelPrice}
              onChange={(event) => setFuelPrice(event.target.value)}
              placeholder={t('fuelCost.placeholders.fuelPrice')}
            />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3 text-sm font-semibold text-zinc-800 shadow-sm dark:bg-zinc-900/50 dark:text-zinc-100">
          <span>{t('fuelCost.resultLabel')}</span>
          <span>
            {formatNumber(fuelCost)} {t('unit.currency')}
          </span>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="space-y-1">
          <h3 className="t-d-1 t-basic-1">{t('carbon.title')}</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('carbon.description')}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            <label htmlFor={ids.carbonDistance}>{t('carbon.fields.distanceOneWay')}</label>
            <Input
              id={ids.carbonDistance}
              inputMode="numeric"
              value={distanceOneWay}
              onChange={(event) => setDistanceOneWay(event.target.value)}
              placeholder={t('carbon.placeholders.distanceOneWay')}
            />
          </div>
          <div className="space-y-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            <label htmlFor={ids.carbonWorkdays}>{t('carbon.fields.workdays')}</label>
            <Input
              id={ids.carbonWorkdays}
              inputMode="numeric"
              value={workdays}
              onChange={(event) => setWorkdays(event.target.value)}
              placeholder={t('carbon.placeholders.workdays')}
            />
          </div>
          <div className="space-y-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            <label htmlFor={ids.carbonEmission}>{t('carbon.fields.emissionPerKm')}</label>
            <Input
              id={ids.carbonEmission}
              inputMode="numeric"
              value={emissionPerKm}
              onChange={(event) => setEmissionPerKm(event.target.value)}
              placeholder={t('carbon.placeholders.emissionPerKm')}
            />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3 text-sm font-semibold text-zinc-800 shadow-sm dark:bg-zinc-900/50 dark:text-zinc-100">
          <span>{t('carbon.resultLabel')}</span>
          <span>
            {formatNumber(carbonEmission)} {t('unit.kgCo2')}
          </span>
        </div>
      </section>
    </div>
  );
}
