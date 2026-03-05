'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Textarea } from '@components/basic/Textarea';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const DEFAULT_MINUTES = 60;
const DEFAULT_BUFFER = 5;

const parseTopics = (value: string) =>
  value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

type AgendaItem = {
  topic: string;
  minutes: number;
};

type MeetingAgendaClientProps = {
  lng: Language;
};

export default function MeetingAgendaClient({ lng }: MeetingAgendaClientProps) {
  const { t } = useTranslation(lng, 'meeting-agenda');
  const [title, setTitle] = useState('');
  const [totalMinutes, setTotalMinutes] = useState(String(DEFAULT_MINUTES));
  const [bufferMinutes, setBufferMinutes] = useState(String(DEFAULT_BUFFER));
  const [topicInput, setTopicInput] = useState('');

  const topics = useMemo(() => parseTopics(topicInput), [topicInput]);

  const agenda = useMemo(() => {
    const total = Number(totalMinutes) || 0;
    const buffer = Number(bufferMinutes) || 0;
    if (!topics.length || total <= 0) return [] as AgendaItem[];

    const usable = Math.max(total - buffer, 0);
    const base = Math.floor(usable / topics.length);
    const remainder = usable % topics.length;

    return topics.map((topic, index) => ({
      topic,
      minutes: base + (index < remainder ? 1 : 0),
    }));
  }, [topics, totalMinutes, bufferMinutes]);

  const reset = () => {
    setTitle('');
    setTotalMinutes(String(DEFAULT_MINUTES));
    setBufferMinutes(String(DEFAULT_BUFFER));
    setTopicInput('');
  };

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">{t('titleLabel')}</p>
          <Input
            placeholder={t('titlePlaceholder')}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('totalMinutesLabel')}</span>
            <Input
              type="number"
              min={10}
              step="5"
              value={totalMinutes}
              onChange={(event) => setTotalMinutes(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('bufferMinutesLabel')}</span>
            <Input
              type="number"
              min={0}
              step="1"
              value={bufferMinutes}
              onChange={(event) => setBufferMinutes(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">{t('topicsLabel')}</p>
          <Textarea
            className="min-h-[140px] resize-none"
            placeholder={t('topicsPlaceholder')}
            value={topicInput}
            onChange={(event) => setTopicInput(event.target.value)}
          />
        </div>

        <p className="text-xs text-gray-500">{t('tips')}</p>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={reset} className="px-4 bg-gray-200 text-gray-700">
            {t('reset')}
          </Button>
        </div>
      </section>

      <section className={`${SERVICE_PANEL_SOFT} space-y-3 p-4`}>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('agendaTitle')}</p>
          <p className="text-sm text-gray-500">{title || t('agendaFallback')}</p>
        </div>

        {agenda.length ? (
          <ul className="space-y-2 text-sm">
            {agenda.map((item) => (
              <li key={item.topic} className="flex items-center justify-between">
                <span className="text-gray-700">{item.topic}</span>
                <span className="font-medium text-gray-800">
                  {t('minutes', { value: item.minutes })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">{t('emptyState')}</p>
        )}
      </section>
    </div>
  );
}
