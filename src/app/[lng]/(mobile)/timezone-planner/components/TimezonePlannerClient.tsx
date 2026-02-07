'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, MinusCircle, PlusCircle } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/basic/Table';
import { Text } from '@components/basic/Text';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface TimezonePlannerClientProps {
  lng: Language;
}

const TIMEZONES = [
  { value: 'Asia/Seoul', label: 'Asia/Seoul (GMT+9)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (GMT+9)' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (GMT+8)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (GMT+8)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (GMT+5:30)' },
  { value: 'Europe/London', label: 'Europe/London (GMT+0)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (GMT+1)' },
  { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
  { value: 'America/Chicago', label: 'America/Chicago (GMT-6)' },
  { value: 'America/Denver', label: 'America/Denver (GMT-7)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (GMT-8)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (GMT+10)' },
];

const DEFAULT_TIMEZONES = ['Asia/Seoul', 'Asia/Tokyo', 'Europe/London', 'America/New_York'];

const getLocalDateTimeInput = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
};

const parseDateTime = (value: string) => {
  if (!value) return null;
  const [datePart, timePart] = value.split('T');
  if (!datePart || !timePart) return null;
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  if ([year, month, day, hour, minute].some((item) => Number.isNaN(item))) return null;
  return { year, month, day, hour, minute };
};

const getTimeZoneOffsetMinutes = (date: Date, timeZone: string) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date).reduce<Record<string, string>>((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  const utcTime = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return (utcTime - date.getTime()) / 60000;
};

const makeZonedDate = (value: string, timeZone: string) => {
  const parts = parseDateTime(value);
  if (!parts) return null;
  const utcGuess = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute),
  );
  const offset = getTimeZoneOffsetMinutes(utcGuess, timeZone);
  return new Date(utcGuess.getTime() - offset * 60000);
};

const formatDateKey = (date: Date, timeZone: string) => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const formatOffsetLabel = (date: Date, timeZone: string) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
  });
  const parts = formatter.formatToParts(date);
  const offsetPart = parts.find((part) => part.type === 'timeZoneName');
  return offsetPart?.value ?? 'UTC';
};

export default function TimezonePlannerClient({ lng }: TimezonePlannerClientProps) {
  const { t } = useTranslation(lng, 'timezone-planner');
  const [baseTimeZone, setBaseTimeZone] = useState('Asia/Seoul');
  const [dateTime, setDateTime] = useState(getLocalDateTimeInput());
  const [selectedTimeZones, setSelectedTimeZones] = useState<string[]>(DEFAULT_TIMEZONES);
  const [pendingZone, setPendingZone] = useState('');
  const [copiedZone, setCopiedZone] = useState<string | null>(null);

  const baseDate = useMemo(() => makeZonedDate(dateTime, baseTimeZone), [dateTime, baseTimeZone]);

  const results = useMemo(() => {
    if (!baseDate) return [];
    const baseKey = formatDateKey(baseDate, baseTimeZone);
    return selectedTimeZones.map((zone) => {
      const formatted = new Intl.DateTimeFormat(lng, {
        timeZone: zone,
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(baseDate);

      const targetKey = formatDateKey(baseDate, zone);
      const diffDays = (Date.parse(targetKey) - Date.parse(baseKey)) / (24 * 60 * 60 * 1000);

      return {
        zone,
        label: TIMEZONES.find((item) => item.value === zone)?.label ?? zone,
        formatted,
        offsetLabel: formatOffsetLabel(baseDate, zone),
        diffDays,
      };
    });
  }, [baseDate, baseTimeZone, selectedTimeZones, lng]);

  const availableTimeZones = TIMEZONES.filter((zone) => !selectedTimeZones.includes(zone.value));

  const handleAddZone = () => {
    if (!pendingZone || selectedTimeZones.includes(pendingZone)) return;
    setSelectedTimeZones((prev) => [...prev, pendingZone]);
    setPendingZone('');
  };

  const handleRemoveZone = (zone: string) => {
    setSelectedTimeZones((prev) => prev.filter((item) => item !== zone));
  };

  const handleUseNow = () => {
    setDateTime(getLocalDateTimeInput());
  };

  const handleReset = () => {
    setBaseTimeZone('Asia/Seoul');
    setSelectedTimeZones(DEFAULT_TIMEZONES);
    setDateTime(getLocalDateTimeInput());
  };

  const handleCopy = async (text: string, zone: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedZone(zone);
      setTimeout(() => setCopiedZone(null), 1500);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy time:', error);
    }
  };

  const dayOffsetLabel = (diffDays: number) => {
    if (diffDays === 0) return t('dayOffset.same');
    if (diffDays > 0) return t('dayOffset.next', { count: diffDays });
    return t('dayOffset.previous', { count: Math.abs(diffDays) });
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <Text variant="d3" color="basic-4">
            {t('helper')}
          </Text>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="timezone-base"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.baseTimezone')}
            </label>
            <Select value={baseTimeZone} onValueChange={setBaseTimeZone}>
              <SelectTrigger id="timezone-base">
                <SelectValue placeholder={t('placeholder.selectTimezone')} />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((zone) => (
                  <SelectItem key={zone.value} value={zone.value}>
                    {zone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="timezone-datetime"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.baseDateTime')}
            </label>
            <Input
              id="timezone-datetime"
              type="datetime-local"
              value={dateTime}
              onChange={(event) => setDateTime(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={handleUseNow} className="px-3 py-2 text-xs">
                {t('button.useNow')}
              </Button>
              <Button type="button" onClick={handleReset} className="px-3 py-2 text-xs">
                {t('button.reset')}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="timezone-add"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.addTimezone')}
          </label>
          <div className="flex flex-col gap-2 md:flex-row">
            <Select value={pendingZone} onValueChange={setPendingZone}>
              <SelectTrigger id="timezone-add">
                <SelectValue placeholder={t('placeholder.addTimezone')} />
              </SelectTrigger>
              <SelectContent>
                {availableTimeZones.map((zone) => (
                  <SelectItem key={zone.value} value={zone.value}>
                    {zone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={handleAddZone}
              className="flex items-center gap-2 px-3 py-2 text-xs"
              disabled={!pendingZone}
            >
              <PlusCircle size={16} />
              {t('button.add')}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTimeZones.map((zone) => (
              <button
                type="button"
                key={zone}
                onClick={() => handleRemoveZone(zone)}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 transition hover:border-point-2 hover:text-point-2 dark:border-gray-700 dark:text-gray-300"
              >
                <MinusCircle size={14} />
                {TIMEZONES.find((item) => item.value === zone)?.label ?? zone}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        {!baseDate && (
          <Text variant="d3" color="basic-5">
            {t('empty')}
          </Text>
        )}
        {baseDate && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.timezone')}</TableHead>
                <TableHead>{t('table.offset')}</TableHead>
                <TableHead>{t('table.time')}</TableHead>
                <TableHead>{t('table.dayOffset')}</TableHead>
                <TableHead>{t('table.copy')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((item) => (
                <TableRow key={item.zone}>
                  <TableCell>{item.label}</TableCell>
                  <TableCell>{item.offsetLabel}</TableCell>
                  <TableCell className="font-medium">{item.formatted}</TableCell>
                  <TableCell>{dayOffsetLabel(item.diffDays)}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      onClick={() => handleCopy(item.formatted, item.zone)}
                      className="flex items-center gap-2 px-3 py-2 text-xs"
                    >
                      {copiedZone === item.zone ? (
                        <ClipboardCheck size={16} />
                      ) : (
                        <Clipboard size={16} />
                      )}
                      {copiedZone === item.zone ? t('button.copied') : t('button.copy')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
