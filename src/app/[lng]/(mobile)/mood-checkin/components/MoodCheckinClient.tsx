'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { Textarea } from '@components/basic/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const energyLevels = ['1', '2', '3', '4', '5'];

type MoodCheckinClientProps = {
  lng: Language;
};

type MoodOption = {
  id: string;
  emoji: string;
  label: string;
  description: string;
};

const createSummary = (summaryParts: {
  prefix: string;
  energy: string;
  stress: string;
  note: string;
  time: string;
}) =>
  [
    summaryParts.prefix,
    summaryParts.energy,
    summaryParts.stress,
    summaryParts.note,
    summaryParts.time,
  ].join('\n');

export default function MoodCheckinClient({ lng }: MoodCheckinClientProps) {
  const { t } = useTranslation(lng, 'mood-checkin');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [energy, setEnergy] = useState<string>('3');
  const [stress, setStress] = useState<string>('3');
  const [note, setNote] = useState('');
  const [summary, setSummary] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const moods = useMemo<MoodOption[]>(
    () => [
      {
        id: 'great',
        emoji: '😄',
        label: t('moods.great.label'),
        description: t('moods.great.description'),
      },
      {
        id: 'good',
        emoji: '🙂',
        label: t('moods.good.label'),
        description: t('moods.good.description'),
      },
      {
        id: 'okay',
        emoji: '😐',
        label: t('moods.okay.label'),
        description: t('moods.okay.description'),
      },
      {
        id: 'down',
        emoji: '😕',
        label: t('moods.down.label'),
        description: t('moods.down.description'),
      },
      {
        id: 'rough',
        emoji: '😣',
        label: t('moods.rough.label'),
        description: t('moods.rough.description'),
      },
    ],
    [t],
  );

  const selectedMoodLabel = useMemo(() => {
    const mood = moods.find((item) => item.id === selectedMood);
    return mood?.label ?? '';
  }, [moods, selectedMood]);

  const handleGenerate = () => {
    setStatusMessage('');
    if (!selectedMood) {
      setErrorMessage(t('validation.mood'));
      return;
    }
    setErrorMessage('');
    const timestamp = new Date().toLocaleString(lng);
    const energyLabel = t(`levels.${energy}`);
    const stressLabel = t(`levels.${stress}`);
    const noteText = note ? t('summary.note', { note }) : t('summary.noteEmpty');

    const summaryText = createSummary({
      prefix: t('summary.prefix', { mood: selectedMoodLabel }),
      energy: t('summary.energy', { level: energyLabel }),
      stress: t('summary.stress', { level: stressLabel }),
      note: noteText,
      time: t('summary.time', { time: timestamp }),
    });

    setSummary(summaryText);
  };

  const handleCopy = async () => {
    if (!summary) return;
    await navigator.clipboard.writeText(summary);
    setStatusMessage(t('status.copied'));
  };

  const handleReset = () => {
    setSelectedMood('');
    setEnergy('3');
    setStress('3');
    setNote('');
    setSummary('');
    setStatusMessage('');
    setErrorMessage('');
  };

  const handleExample = () => {
    setSelectedMood('good');
    setEnergy('4');
    setStress('2');
    setNote(t('example.note'));
    setSummary('');
    setStatusMessage('');
    setErrorMessage('');
  };

  return (
    <div className="space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <Text variant="d2" className="font-semibold">
            {t('sections.mood')}
          </Text>
          <div className="grid gap-3 sm:grid-cols-2">
            {moods.map((mood) => (
              <button
                key={mood.id}
                type="button"
                onClick={() => setSelectedMood(mood.id)}
                className={cn(
                  'flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all',
                  selectedMood === mood.id
                    ? 'border-point-2 bg-point-2/10'
                    : 'border-gray-200 bg-white hover:border-point-2/70 dark:border-gray-700 dark:bg-gray-900',
                )}
              >
                <div>
                  <Text variant="d2" className="font-semibold">
                    {mood.emoji} {mood.label}
                  </Text>
                  <Text variant="d3" color="basic-5" className="mt-1">
                    {mood.description}
                  </Text>
                </div>
              </button>
            ))}
          </div>
          {errorMessage && (
            <Text variant="d3" color="basic-5" className="text-red-500">
              {errorMessage}
            </Text>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Text variant="d2" className="font-semibold">
              {t('sections.energy')}
            </Text>
            <Select value={energy} onValueChange={setEnergy}>
              <SelectTrigger aria-label={t('sections.energy')}>
                <SelectValue placeholder={t('labels.select')} />
              </SelectTrigger>
              <SelectContent>
                {energyLevels.map((level) => (
                  <SelectItem key={`energy-${level}`} value={level}>
                    {t(`levels.${level}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Text variant="d2" className="font-semibold">
              {t('sections.stress')}
            </Text>
            <Select value={stress} onValueChange={setStress}>
              <SelectTrigger aria-label={t('sections.stress')}>
                <SelectValue placeholder={t('labels.select')} />
              </SelectTrigger>
              <SelectContent>
                {energyLevels.map((level) => (
                  <SelectItem key={`stress-${level}`} value={level}>
                    {t(`levels.${level}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Text variant="d2" className="font-semibold">
            {t('sections.note')}
          </Text>
          <Textarea
            className="h-24 resize-none"
            placeholder={t('note.placeholder')}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleGenerate}>
            {t('actions.generate')}
          </Button>
          <Button type="button" onClick={handleExample} className="bg-gray-500 hover:bg-gray-400">
            {t('actions.example')}
          </Button>
          <Button type="button" onClick={handleReset} className="bg-gray-700 hover:bg-gray-600">
            {t('actions.reset')}
          </Button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text variant="d2" className="font-semibold">
          {t('summary.title')}
        </Text>
        {summary ? (
          <div className="space-y-3">
            <Text asChild variant="d2" color="basic-4">
              <p className="whitespace-pre-line">{summary}</p>
            </Text>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={handleCopy}>
                {t('actions.copy')}
              </Button>
              {statusMessage && (
                <Text variant="d3" color="basic-5" className="self-center">
                  {statusMessage}
                </Text>
              )}
            </div>
          </div>
        ) : (
          <Text variant="d3" color="basic-5">
            {t('summary.empty')}
          </Text>
        )}
      </section>
    </div>
  );
}
