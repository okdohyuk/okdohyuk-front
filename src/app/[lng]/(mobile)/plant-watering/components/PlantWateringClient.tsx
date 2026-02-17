'use client';

import React from 'react';
import { addDays, differenceInCalendarDays, format, isValid, parseISO } from 'date-fns';
import { useTranslation } from '~/app/i18n/client';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';

type PlantItem = {
  id: string;
  name: string;
  lastWatered: string;
  intervalDays: number;
};

type PlantWateringClientProps = {
  lng: Language;
};

const getTodayValue = () => format(new Date(), 'yyyy-MM-dd');

const formatDate = (value: string) => {
  const parsed = parseISO(value);
  if (!isValid(parsed)) return value;
  return format(parsed, 'yyyy-MM-dd');
};

export default function PlantWateringClient({ lng }: PlantWateringClientProps) {
  const { t } = useTranslation(lng, 'plant-watering');
  const [name, setName] = React.useState('');
  const [lastWatered, setLastWatered] = React.useState(getTodayValue());
  const [intervalDays, setIntervalDays] = React.useState('7');
  const [plants, setPlants] = React.useState<PlantItem[]>([]);

  const handleAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const interval = Number(intervalDays);

    if (!trimmedName || !lastWatered || Number.isNaN(interval) || interval <= 0) return;

    setPlants((prev) => [
      {
        id: `${Date.now()}-${trimmedName}`,
        name: trimmedName,
        lastWatered,
        intervalDays: interval,
      },
      ...prev,
    ]);
    setName('');
  };

  const handleRemove = (id: string) => {
    setPlants((prev) => prev.filter((plant) => plant.id !== id));
  };

  const handleResetToday = () => {
    setLastWatered(getTodayValue());
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="space-y-1">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {t('form.nameLabel')}
          </span>
          <Input
            placeholder={t('form.namePlaceholder')}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {t('form.lastWateredLabel')}
            </span>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={lastWatered}
                onChange={(event) => setLastWatered(event.target.value)}
              />
              <Button type="button" className="w-20" onClick={handleResetToday}>
                {t('form.today')}
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {t('form.intervalLabel')}
            </span>
            <Input
              type="number"
              min={1}
              step={1}
              value={intervalDays}
              onChange={(event) => setIntervalDays(event.target.value)}
            />
          </div>
        </div>
        <Button type="submit" className="w-full">
          {t('form.add')}
        </Button>
      </form>

      <section className="space-y-3">
        {plants.length === 0 ? (
          <div className={cn(SERVICE_PANEL_SOFT, 'p-4 text-sm text-gray-500 dark:text-gray-300')}>
            {t('list.empty')}
          </div>
        ) : (
          plants.map((plant) => {
            const nextDate = addDays(parseISO(plant.lastWatered), plant.intervalDays);
            const diff = differenceInCalendarDays(nextDate, new Date());
            const nextDateText = format(nextDate, 'yyyy-MM-dd');
            let status: 'today' | 'daysLeft' | 'overdue' = 'daysLeft';
            if (diff === 0) {
              status = 'today';
            } else if (diff < 0) {
              status = 'overdue';
            }

            return (
              <div
                key={plant.id}
                className={cn(
                  SERVICE_PANEL_SOFT,
                  SERVICE_CARD_INTERACTIVE,
                  'flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between',
                )}
              >
                <div className="space-y-1">
                  <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {plant.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">
                    {t('list.lastWatered')}: {formatDate(plant.lastWatered)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">
                    {t('list.nextWatering')}: {nextDateText}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
                  <div className="text-sm font-semibold text-point-1">
                    {status === 'today' && t('list.today')}
                    {status === 'daysLeft' && t('list.daysLeft', { count: diff })}
                    {status === 'overdue' && t('list.overdue', { count: Math.abs(diff) })}
                  </div>
                  <Button type="button" className="w-20" onClick={() => handleRemove(plant.id)}>
                    {t('list.remove')}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
