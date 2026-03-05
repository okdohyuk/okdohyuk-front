'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Textarea } from '@components/basic/Textarea';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const MAX_DAYS = 30;
const MAX_SESSIONS = 4;
const DEFAULT_DAYS = 7;
const DEFAULT_SESSIONS = 2;

const parseTopics = (value: string) =>
  value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

type StudyPlanClientProps = {
  lng: Language;
};

type StudySession = {
  id: string;
  topic: string;
};

type StudyDay = {
  label: string;
  sessions: StudySession[];
};

export default function StudyPlanClient({ lng }: StudyPlanClientProps) {
  const { t } = useTranslation(lng, 'study-plan');
  const [topicInput, setTopicInput] = useState('');
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [sessionsPerDay, setSessionsPerDay] = useState(DEFAULT_SESSIONS);
  const [plan, setPlan] = useState<StudyDay[]>([]);

  const dayNames = t('dayNames', { returnObjects: true }) as string[];
  const dayPrefix = t('dayPrefix');

  const topics = useMemo(() => parseTopics(topicInput), [topicInput]);
  const canGenerate = topics.length > 0;

  const buildPlan = () => {
    if (!canGenerate) return;

    const totalSessions = days * sessionsPerDay;
    const sessionTopics = Array.from(
      { length: totalSessions },
      (_, index) => topics[index % topics.length],
    );

    const nextPlan: StudyDay[] = Array.from({ length: days }).map((_, dayIndex) => {
      const label = dayNames[dayIndex] ?? `${dayPrefix} ${dayIndex + 1}`;
      const startIndex = dayIndex * sessionsPerDay;
      const sessions = sessionTopics
        .slice(startIndex, startIndex + sessionsPerDay)
        .map((topic, sessionIndex) => ({
          id: `${dayIndex}-${sessionIndex}-${topic}`,
          topic,
        }));
      return { label, sessions };
    });

    setPlan(nextPlan);
  };

  const handleDaysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) {
      setDays(DEFAULT_DAYS);
      return;
    }
    const clamped = Math.min(Math.max(value, 1), MAX_DAYS);
    setDays(clamped);
  };

  const handleSessionsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) {
      setSessionsPerDay(DEFAULT_SESSIONS);
      return;
    }
    const clamped = Math.min(Math.max(value, 1), MAX_SESSIONS);
    setSessionsPerDay(clamped);
  };

  const reset = () => {
    setTopicInput('');
    setDays(DEFAULT_DAYS);
    setSessionsPerDay(DEFAULT_SESSIONS);
    setPlan([]);
  };

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">{t('topicsLabel')}</p>
          <Textarea
            className="min-h-[140px] resize-none"
            placeholder={t('topicsPlaceholder')}
            value={topicInput}
            onChange={(event) => setTopicInput(event.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('daysLabel')}</span>
            <Input type="number" min={1} max={MAX_DAYS} value={days} onChange={handleDaysChange} />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('sessionsLabel')}</span>
            <Input
              type="number"
              min={1}
              max={MAX_SESSIONS}
              value={sessionsPerDay}
              onChange={handleSessionsChange}
            />
          </div>
        </div>

        <p className="text-xs text-gray-500">{t('tips')}</p>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={buildPlan} disabled={!canGenerate} className="px-4">
            {t('generate')}
          </Button>
          <Button type="button" onClick={buildPlan} disabled={!canGenerate} className="px-4">
            {t('shuffle')}
          </Button>
          <Button type="button" onClick={reset} className="px-4 bg-gray-200 text-gray-700">
            {t('reset')}
          </Button>
        </div>
      </section>

      {plan.length ? (
        <section className="space-y-3">
          {plan.map((day) => (
            <article key={day.label} className={`${SERVICE_PANEL_SOFT} space-y-2 p-4`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">{day.label}</h3>
                <span className="text-xs text-gray-500">{t('planTitle')}</span>
              </div>
              <ul className="space-y-1 text-sm">
                {day.sessions.map((session, index) => (
                  <li key={session.id} className="flex items-center gap-2">
                    <span className="text-gray-500">#{index + 1}</span>
                    <span className="font-medium text-gray-800">{session.topic}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      ) : (
        <section className={`${SERVICE_PANEL_SOFT} p-4 text-sm text-gray-500`}>
          {t('emptyState')}
        </section>
      )}
    </div>
  );
}
