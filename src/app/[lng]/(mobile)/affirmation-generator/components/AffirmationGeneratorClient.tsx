'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';

const categories = ['confidence', 'calm', 'focus', 'gratitude', 'growth'] as const;

type CategoryKey = (typeof categories)[number];

type AffirmationGeneratorClientProps = {
  lng: Language;
};

const pickRandom = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export default function AffirmationGeneratorClient({ lng }: AffirmationGeneratorClientProps) {
  const { t } = useTranslation(lng, 'affirmation-generator');
  const [category, setCategory] = useState<CategoryKey>('confidence');
  const [name, setName] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const categoryLabels = t('categories', { returnObjects: true }) as Record<CategoryKey, string>;
  const affirmations = t(`affirmations.${category}`, { returnObjects: true }) as string[];

  const formattedAffirmations = useMemo(() => {
    if (!name.trim()) return affirmations;
    return affirmations.map((item) => item.replace('{name}', name.trim()));
  }, [affirmations, name]);

  const currentAffirmation = formattedAffirmations[currentIndex] ?? '';

  const shuffle = () => {
    if (!formattedAffirmations.length) return;
    const next = pickRandom(formattedAffirmations);
    const nextIndex = formattedAffirmations.indexOf(next);
    setCurrentIndex(nextIndex < 0 ? 0 : nextIndex);
  };

  const reset = () => {
    setCategory('confidence');
    setName('');
    setCurrentIndex(0);
  };

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">{t('categoryLabel')}</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setCategory(key);
                  setCurrentIndex(0);
                }}
                className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium transition-colors',
                  category === key
                    ? 'bg-point-2 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                )}
              >
                {categoryLabels[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">{t('nameLabel')}</p>
          <Input
            placeholder={t('namePlaceholder')}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="rounded-xl bg-gray-50 px-4 py-6 text-center text-lg font-semibold text-gray-800">
          {currentAffirmation || t('emptyState')}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={shuffle} className="px-4">
            {t('shuffle')}
          </Button>
          <Button type="button" onClick={reset} className="px-4 bg-gray-200 text-gray-700">
            {t('reset')}
          </Button>
        </div>
      </section>

      <section className={`${SERVICE_PANEL_SOFT} space-y-2 p-4 text-sm text-gray-600`}>
        <p className="font-semibold text-gray-700">{t('tipsTitle')}</p>
        <ul className="list-disc space-y-1 pl-5">
          {(t('tips', { returnObjects: true }) as string[]).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
