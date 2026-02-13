'use client';

import React, { useMemo, useState } from 'react';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import {
  SERVICE_PAGE_SURFACE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

type MeetingCostClientProps = {
  lng: Language;
};

const parseNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function MeetingCostClient({ lng }: MeetingCostClientProps) {
  const { t } = useTranslation(lng, 'meeting-cost');
  const [attendees, setAttendees] = useState('5');
  const [hourlyRate, setHourlyRate] = useState('20000');
  const [hours, setHours] = useState('1');
  const [minutes, setMinutes] = useState('30');

  const { totalCost, durationHours } = useMemo(() => {
    const attendeeCount = parseNumber(attendees);
    const rate = parseNumber(hourlyRate);
    const hourValue = parseNumber(hours);
    const minuteValue = parseNumber(minutes);
    const duration = Math.max(0, hourValue) + Math.max(0, minuteValue) / 60;
    const cost = Math.max(0, attendeeCount) * Math.max(0, rate) * duration;

    return {
      totalCost: cost,
      durationHours: duration,
    };
  }, [attendees, hourlyRate, hours, minutes]);

  const handleClear = () => {
    setAttendees('');
    setHourlyRate('');
    setHours('');
    setMinutes('');
  };

  const handleSample = () => {
    setAttendees('6');
    setHourlyRate('18000');
    setHours('1');
    setMinutes('0');
  };

  return (
    <div className={cn(SERVICE_PAGE_SURFACE, 'space-y-4')}>
      <div className="space-y-3">
        <Text variant="d2" color="basic-5">
          {t('helper')}
        </Text>
        <div className="grid gap-3 md:grid-cols-2">
          <div className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-3')}>
            <Text variant="d2" color="basic-3">
              {t('label.attendees')}
            </Text>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={t('placeholder.attendees')}
              value={attendees}
              onChange={(event) => setAttendees(event.target.value)}
            />
          </div>
          <div className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-3')}>
            <Text variant="d2" color="basic-3">
              {t('label.hourlyRate')}
            </Text>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={t('placeholder.hourlyRate')}
              value={hourlyRate}
              onChange={(event) => setHourlyRate(event.target.value)}
            />
          </div>
          <div className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-3')}>
            <Text variant="d2" color="basic-3">
              {t('label.hours')}
            </Text>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={t('placeholder.hours')}
              value={hours}
              onChange={(event) => setHours(event.target.value)}
            />
          </div>
          <div className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-3')}>
            <Text variant="d2" color="basic-3">
              {t('label.minutes')}
            </Text>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              max={59}
              placeholder={t('placeholder.minutes')}
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <Text variant="d2" color="basic-4">
              {t('result.label')}
            </Text>
            <Text variant="t2" color="basic-1">
              {totalCost.toLocaleString()} {t('result.unit')}
            </Text>
            <Text variant="c1" color="basic-5">
              {t('result.duration', { duration: durationHours.toFixed(2) })}
            </Text>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleSample}
              className="bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100"
            >
              {t('button.sample')}
            </Button>
            <Button type="button" onClick={handleClear}>
              {t('button.clear')}
            </Button>
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
            <Text variant="c1" color="basic-5">
              {t('result.perPerson')}
            </Text>
            <Text variant="d1" color="basic-2">
              {attendees && parseNumber(attendees) > 0
                ? (totalCost / Math.max(1, parseNumber(attendees))).toLocaleString()
                : '0'}{' '}
              {t('result.unit')}
            </Text>
          </div>
          <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
            <Text variant="c1" color="basic-5">
              {t('result.perHour')}
            </Text>
            <Text variant="d1" color="basic-2">
              {durationHours > 0 ? (totalCost / durationHours).toLocaleString() : '0'}{' '}
              {t('result.unit')}
            </Text>
          </div>
          <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
            <Text variant="c1" color="basic-5">
              {t('result.attendeeCount')}
            </Text>
            <Text variant="d1" color="basic-2">
              {parseNumber(attendees).toLocaleString()} {t('result.people')}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
