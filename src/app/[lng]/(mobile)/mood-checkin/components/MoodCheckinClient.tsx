'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';

const moodKeys = ['veryLow', 'low', 'neutral', 'high', 'veryHigh'] as const;
const energyKeys = ['low', 'medium', 'high'] as const;
const stressKeys = ['low', 'medium', 'high'] as const;

type MoodKey = (typeof moodKeys)[number];

type EnergyKey = (typeof energyKeys)[number];

type StressKey = (typeof stressKeys)[number];

type MoodCheckinClientProps = {
  lng: Language;
};

const getRandomIndex = (length: number) => Math.floor(Math.random() * length);

export default function MoodCheckinClient({ lng }: MoodCheckinClientProps) {
  const { t } = useTranslation(lng, 'mood-checkin');
  const [mood, setMood] = useState<MoodKey>('neutral');
  const [energy, setEnergy] = useState<EnergyKey>('medium');
  const [stress, setStress] = useState<StressKey>('medium');
  const [note, setNote] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);

  const moodLabels = t('moodOptions', { returnObjects: true }) as Record<MoodKey, string>;
  const energyLabels = t('energyOptions', { returnObjects: true }) as Record<EnergyKey, string>;
  const stressLabels = t('stressOptions', { returnObjects: true }) as Record<StressKey, string>;
  const prompts = t('prompts', { returnObjects: true }) as string[];

  const summary = t('summary', {
    mood: moodLabels[mood],
    energy: energyLabels[energy],
    stress: stressLabels[stress],
  });

  const suggestions = useMemo(() => {
    const items: string[] = [];

    if (mood === 'veryLow' || mood === 'low') {
      items.push(...(t('suggestions.lowMood', { returnObjects: true }) as string[]));
    }

    if (mood === 'high' || mood === 'veryHigh') {
      items.push(...(t('suggestions.goodMood', { returnObjects: true }) as string[]));
    }

    if (energy === 'low') {
      items.push(...(t('suggestions.lowEnergy', { returnObjects: true }) as string[]));
    }

    if (stress === 'high') {
      items.push(...(t('suggestions.highStress', { returnObjects: true }) as string[]));
    }

    if (!items.length) {
      items.push(...(t('suggestions.neutral', { returnObjects: true }) as string[]));
    }

    return Array.from(new Set(items));
  }, [mood, energy, stress, t]);

  const resetCheckin = () => {
    setMood('neutral');
    setEnergy('medium');
    setStress('medium');
    setNote('');
    setPromptIndex(0);
  };

  const shufflePrompt = () => {
    if (!prompts.length) return;
    setPromptIndex(getRandomIndex(prompts.length));
  };

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">{t('moodLabel')}</p>
          <div className="flex flex-wrap gap-2">
            {moodKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setMood(key)}
                className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium transition-colors',
                  mood === key
                    ? 'bg-point-2 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                )}
              >
                {moodLabels[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">{t('energyLabel')}</p>
            <div className="flex flex-wrap gap-2">
              {energyKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setEnergy(key)}
                  className={cn(
                    'rounded-full px-3 py-1 text-sm font-medium transition-colors',
                    energy === key
                      ? 'bg-point-2 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  )}
                >
                  {energyLabels[key]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">{t('stressLabel')}</p>
            <div className="flex flex-wrap gap-2">
              {stressKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStress(key)}
                  className={cn(
                    'rounded-full px-3 py-1 text-sm font-medium transition-colors',
                    stress === key
                      ? 'bg-point-2 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  )}
                >
                  {stressLabels[key]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">{t('promptLabel')}</p>
            <Button type="button" onClick={shufflePrompt} className="px-3 text-sm">
              {t('shufflePrompt')}
            </Button>
          </div>
          <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
            {prompts[promptIndex] ?? ''}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">{t('noteLabel')}</p>
          <Textarea
            className="min-h-[120px] resize-none"
            placeholder={t('notePlaceholder')}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={resetCheckin} className="px-4 bg-gray-200 text-gray-700">
            {t('reset')}
          </Button>
        </div>
      </section>

      <section className={`${SERVICE_PANEL_SOFT} space-y-3 p-4`}>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('summaryTitle')}</p>
          <p className="text-sm text-gray-600">{summary}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">{t('suggestionsTitle')}</p>
          <ul className="space-y-1 text-sm text-gray-600">
            {suggestions.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
