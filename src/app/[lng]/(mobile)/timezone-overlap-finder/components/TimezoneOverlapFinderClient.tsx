'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Input } from '@components/basic/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { Button } from '@components/basic/Button';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

type Props = {
  lng: Language;
};

type Member = {
  id: string;
  labelKey: 'a' | 'b' | 'c' | 'd';
  tz: string;
  start: string;
  end: string;
};

type Overlap = {
  startUtcMin: number;
  endUtcMin: number;
  durationMin: number;
};

const TIMEZONES = [
  'Asia/Seoul',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Bangkok',
  'Asia/Dubai',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Australia/Sydney',
  'Pacific/Auckland',
] as const;

const minuteOfDay = (time: string) => {
  const [hourRaw, minuteRaw] = time.split(':');
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return hour * 60 + minute;
};

const getUtcOffsetMinutes = (timeZone: string) => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'shortOffset',
  });

  const parts = formatter.formatToParts(now);
  const offset = parts.find((part) => part.type === 'timeZoneName')?.value ?? 'GMT+0';

  const match = offset.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/i);
  if (!match) {
    return 0;
  }

  const sign = match[1] === '-' ? -1 : 1;
  const hour = Number(match[2]);
  const minute = Number(match[3] ?? '0');

  return sign * (hour * 60 + minute);
};

const formatClock = (totalMinutes: number) => {
  const normalized = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;

  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

const buildUtcWindows = (member: Member) => {
  const start = minuteOfDay(member.start);
  const end = minuteOfDay(member.end);
  if (start === null || end === null) {
    return null;
  }

  const offset = getUtcOffsetMinutes(member.tz);

  if (start === end) {
    return [{ startUtcMin: 0, endUtcMin: 1440 }];
  }

  if (start < end) {
    return [{ startUtcMin: start - offset, endUtcMin: end - offset }];
  }

  return [
    { startUtcMin: start - offset, endUtcMin: 1440 - offset },
    { startUtcMin: -offset, endUtcMin: end - offset },
  ];
};

const intersect = (source: Overlap[], target: Overlap[]) => {
  const result: Overlap[] = [];

  source.forEach((a) => {
    target.forEach((b) => {
      const start = Math.max(a.startUtcMin, b.startUtcMin);
      const end = Math.min(a.endUtcMin, b.endUtcMin);
      if (end > start) {
        result.push({ startUtcMin: start, endUtcMin: end, durationMin: end - start });
      }
    });
  });

  return result;
};

export default function TimezoneOverlapFinderClient({ lng }: Props) {
  const { t } = useTranslation(lng, 'timezone-overlap-finder');
  const reduceMotion = useReducedMotion();

  const [memberCount, setMemberCount] = useState(3);
  const [members, setMembers] = useState<Member[]>([
    { id: 'a', labelKey: 'a', tz: 'Asia/Seoul', start: '09:00', end: '18:00' },
    { id: 'b', labelKey: 'b', tz: 'Europe/London', start: '09:00', end: '18:00' },
    { id: 'c', labelKey: 'c', tz: 'America/New_York', start: '09:00', end: '18:00' },
    { id: 'd', labelKey: 'd', tz: 'Australia/Sydney', start: '10:00', end: '19:00' },
  ]);

  const activeMembers = members.slice(0, memberCount);

  const overlaps = useMemo(() => {
    const windows = activeMembers.map(buildUtcWindows);
    if (windows.some((window) => window === null)) {
      return [];
    }

    let current = (windows[0] ?? []).map((item) => ({
      ...item,
      durationMin: item.endUtcMin - item.startUtcMin,
    }));

    for (let i = 1; i < windows.length; i += 1) {
      current = intersect(
        current,
        (windows[i] ?? []).map((item) => ({
          ...item,
          durationMin: item.endUtcMin - item.startUtcMin,
        })),
      );
      if (current.length === 0) {
        break;
      }
    }

    return current
      .map((slot) => ({
        ...slot,
        startUtcMin: ((slot.startUtcMin % 1440) + 1440) % 1440,
        endUtcMin: ((slot.endUtcMin % 1440) + 1440) % 1440,
      }))
      .sort((a, b) => b.durationMin - a.durationMin);
  }, [activeMembers]);

  const best = overlaps[0] ?? null;

  const updateMember = (id: string, patch: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((member) => (member.id === id ? { ...member, ...patch } : member)),
    );
  };

  return (
    <div className="space-y-4">
      <motion.section
        layout
        transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.2, 0.8, 0.2, 1] }}
        className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-100">
              {t('inputs.memberCount')}
            </p>
            <span className="rounded-full bg-point-1/15 px-2 py-0.5 text-xs font-semibold text-point-1">
              {memberCount}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[2, 3, 4].map((count) => {
              const active = memberCount === count;
              return (
                <Button
                  key={count}
                  onClick={() => setMemberCount(count)}
                  className={cn(
                    'relative h-10 rounded-xl text-sm font-semibold transition-colors',
                    active
                      ? 'bg-point-4 text-white hover:bg-point-4/90'
                      : 'bg-zinc-200/70 text-zinc-700 hover:bg-zinc-300/80 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700',
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="member-count-pill"
                      className="absolute inset-0 rounded-xl bg-point-4"
                      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                    />
                  ) : null}
                  <span className="relative z-10">{count}</span>
                </Button>
              );
            })}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('inputs.memberCountHint')}</p>
        </div>

        <AnimatePresence initial={false}>
          {activeMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? {} : { opacity: 0, y: -10 }}
              transition={{
                duration: reduceMotion ? 0 : 0.22,
                delay: reduceMotion ? 0 : index * 0.04,
              }}
              className="space-y-2 rounded-2xl border border-zinc-200/70 bg-white/65 p-3 dark:border-zinc-700 dark:bg-zinc-900/40"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
                {t(`members.${member.labelKey}` as const)}
              </p>

              <div className="grid gap-2 sm:grid-cols-3">
                <Select
                  value={member.tz}
                  onValueChange={(value) => updateMember(member.id, { tz: value })}
                >
                  <SelectTrigger className="h-10 rounded-xl bg-zinc-100/80 text-left dark:bg-zinc-800/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((zone) => (
                      <SelectItem key={zone} value={zone}>
                        {zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="time"
                  value={member.start}
                  onChange={(event) => updateMember(member.id, { start: event.target.value })}
                  className="h-10 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/80"
                  aria-label={t('inputs.start')}
                />

                <Input
                  type="time"
                  value={member.end}
                  onChange={(event) => updateMember(member.id, { end: event.target.value })}
                  className="h-10 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/80"
                  aria-label={t('inputs.end')}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.section>

      <section className={cn(SERVICE_PANEL_SOFT, 'overflow-hidden p-4')}>
        <AnimatePresence mode="wait">
          <motion.div
            key={best ? `${best.startUtcMin}-${best.endUtcMin}` : 'none'}
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? {} : { opacity: 0, y: -8, scale: 0.985 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.2, 0.8, 0.2, 1] }}
            className="space-y-3"
          >
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-100">
              {t('result.title')}
            </p>
            {best ? (
              <>
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduceMotion ? 0 : 0.05, duration: 0.2 }}
                  className="rounded-2xl bg-point-1/15 px-4 py-4"
                >
                  <p className="text-lg font-bold text-point-1">
                    {t('result.utcRange', {
                      start: formatClock(best.startUtcMin),
                      end: formatClock(best.endUtcMin),
                    })}
                  </p>
                  <p className="mt-1 text-sm text-point-1">
                    {t('result.duration', {
                      hour: Math.floor(best.durationMin / 60),
                      minute: best.durationMin % 60,
                    })}
                  </p>
                </motion.div>

                <div className="space-y-2">
                  {activeMembers.map((member) => {
                    const offset = getUtcOffsetMinutes(member.tz);
                    return (
                      <div
                        key={`best-${member.id}`}
                        className="flex items-center justify-between rounded-xl bg-zinc-100/80 px-3 py-2 text-sm dark:bg-zinc-800/70"
                      >
                        <span className="font-medium text-zinc-700 dark:text-zinc-200">
                          {member.tz}
                        </span>
                        <span className="font-mono text-zinc-600 dark:text-zinc-300">
                          {formatClock(best.startUtcMin + offset)} -{' '}
                          {formatClock(best.endUtcMin + offset)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                {t('result.none')}
              </div>
            )}

            <Button
              onClick={() => {
                setMemberCount(3);
                setMembers([
                  { id: 'a', labelKey: 'a', tz: 'Asia/Seoul', start: '09:00', end: '18:00' },
                  { id: 'b', labelKey: 'b', tz: 'Europe/London', start: '09:00', end: '18:00' },
                  { id: 'c', labelKey: 'c', tz: 'America/New_York', start: '09:00', end: '18:00' },
                  { id: 'd', labelKey: 'd', tz: 'Australia/Sydney', start: '10:00', end: '19:00' },
                ]);
              }}
              className="h-10 w-full rounded-xl bg-zinc-200/70 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              {t('inputs.reset')}
            </Button>
          </motion.div>
        </AnimatePresence>
      </section>

      <p className="px-1 text-xs text-zinc-500 dark:text-zinc-400">{t('footnote')}</p>
    </div>
  );
}
