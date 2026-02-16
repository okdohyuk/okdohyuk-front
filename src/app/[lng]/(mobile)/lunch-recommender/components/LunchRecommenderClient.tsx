'use client';

import React, { useMemo, useState } from 'react';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';
import { H1, Text } from '@components/basic/Text';
import { Button } from '@components/basic/Button';
import Tag from '@components/basic/Tag';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

type MenuItem = {
  id: string;
  cuisines: string[];
  preferences: string[];
};

type Option = {
  key: string;
  label: string;
};

const menuItems: MenuItem[] = [
  { id: 'bibimbap', cuisines: ['korean'], preferences: ['light', 'healthy', 'vegetarian'] },
  { id: 'kimchi-stew', cuisines: ['korean'], preferences: ['spicy', 'hearty', 'warm'] },
  { id: 'bulgogi', cuisines: ['korean'], preferences: ['hearty'] },
  { id: 'sushi', cuisines: ['japanese'], preferences: ['light'] },
  { id: 'ramen', cuisines: ['japanese'], preferences: ['warm', 'hearty'] },
  { id: 'udon', cuisines: ['japanese'], preferences: ['warm', 'light'] },
  { id: 'jjamppong', cuisines: ['chinese'], preferences: ['spicy', 'warm'] },
  { id: 'fried-rice', cuisines: ['chinese'], preferences: ['quick', 'hearty'] },
  { id: 'pasta', cuisines: ['western'], preferences: ['hearty'] },
  { id: 'salad-bowl', cuisines: ['western'], preferences: ['light', 'healthy', 'vegetarian'] },
  { id: 'burger', cuisines: ['western'], preferences: ['quick', 'hearty'] },
  { id: 'sandwich', cuisines: ['snack'], preferences: ['quick', 'light'] },
  { id: 'kimbap', cuisines: ['snack'], preferences: ['quick', 'light'] },
  { id: 'brunch', cuisines: ['cafe'], preferences: ['light'] },
];

const getRandomItem = (items: MenuItem[]) => {
  const index = Math.floor(Math.random() * items.length);
  return items[index];
};

interface LunchRecommenderClientProps {
  lng: Language;
}

export default function LunchRecommenderClient({ lng }: LunchRecommenderClientProps) {
  const { t } = useTranslation(lng, 'lunch-recommender');
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [result, setResult] = useState<MenuItem | null>(null);
  const [message, setMessage] = useState<string>('');

  const cuisineOptions: Option[] = useMemo(
    () => [
      { key: 'korean', label: t('filters.cuisine.korean') },
      { key: 'japanese', label: t('filters.cuisine.japanese') },
      { key: 'chinese', label: t('filters.cuisine.chinese') },
      { key: 'western', label: t('filters.cuisine.western') },
      { key: 'snack', label: t('filters.cuisine.snack') },
      { key: 'cafe', label: t('filters.cuisine.cafe') },
    ],
    [t],
  );

  const preferenceOptions: Option[] = useMemo(
    () => [
      { key: 'spicy', label: t('filters.preference.spicy') },
      { key: 'light', label: t('filters.preference.light') },
      { key: 'hearty', label: t('filters.preference.hearty') },
      { key: 'healthy', label: t('filters.preference.healthy') },
      { key: 'vegetarian', label: t('filters.preference.vegetarian') },
      { key: 'quick', label: t('filters.preference.quick') },
      { key: 'warm', label: t('filters.preference.warm') },
    ],
    [t],
  );

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const cuisineMatch =
        selectedCuisines.length === 0 ||
        item.cuisines.some((cuisine) => selectedCuisines.includes(cuisine));
      const preferenceMatch =
        selectedPreferences.length === 0 ||
        item.preferences.some((preference) => selectedPreferences.includes(preference));
      return cuisineMatch && preferenceMatch;
    });
  }, [selectedCuisines, selectedPreferences]);

  const toggleOption = (
    current: string[],
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setter(
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const handleRecommend = () => {
    setMessage('');
    if (filteredItems.length === 0) {
      setResult(null);
      setMessage(t('error.noResult'));
      return;
    }
    setResult(getRandomItem(filteredItems));
  };

  const handleReset = () => {
    setSelectedCuisines([]);
    setSelectedPreferences([]);
    setResult(null);
    setMessage('');
  };

  const handleCopy = async () => {
    if (!result) return;
    const resultText = `${t('result.label')}: ${t(`menu.${result.id}`)}`;
    try {
      await navigator.clipboard.writeText(resultText);
      setMessage(t('result.copied'));
    } catch (error) {
      setMessage(t('result.copyFailed'));
    }
  };

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-3 p-4`}>
        <div className="space-y-1">
          <Text variant="d2" color="basic-4">
            {t('filters.cuisine.title')}
          </Text>
          <div className="flex flex-wrap gap-2">
            {cuisineOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => toggleOption(selectedCuisines, option.key, setSelectedCuisines)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  selectedCuisines.includes(option.key)
                    ? 'border-point-2 bg-point-2/10 text-point-2'
                    : 'border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <Text variant="d2" color="basic-4">
            {t('filters.preference.title')}
          </Text>
          <div className="flex flex-wrap gap-2">
            {preferenceOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() =>
                  toggleOption(selectedPreferences, option.key, setSelectedPreferences)
                }
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  selectedPreferences.includes(option.key)
                    ? 'border-point-2 bg-point-2/10 text-point-2'
                    : 'border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleRecommend}>
            {result ? t('actions.reroll') : t('actions.recommend')}
          </Button>
          <Button
            type="button"
            className="bg-zinc-800 hover:bg-zinc-700"
            onClick={handleCopy}
            disabled={!result}
          >
            {t('actions.copy')}
          </Button>
          <Button type="button" className="bg-zinc-500 hover:bg-zinc-400" onClick={handleReset}>
            {t('actions.reset')}
          </Button>
        </div>
      </section>

      <section className={`${SERVICE_PANEL_SOFT} space-y-3 p-4`}>
        <Text variant="d2" color="basic-4">
          {t('result.label')}
        </Text>
        {result ? (
          <div className="space-y-3">
            <H1>{t(`menu.${result.id}`)}</H1>
            <div className="flex flex-wrap gap-2">
              {result.cuisines.map((cuisine) => (
                <Tag key={cuisine} tag={t(`filters.cuisine.${cuisine}`)} />
              ))}
              {result.preferences.map((preference) => (
                <Tag key={preference} tag={t(`filters.preference.${preference}`)} />
              ))}
            </div>
          </div>
        ) : (
          <Text variant="d2" color="basic-5">
            {t('result.empty')}
          </Text>
        )}
        <Text variant="c1" color="basic-5">
          {t('result.count', { count: filteredItems.length })}
        </Text>
        {message && (
          <Text variant="d2" color="basic-5">
            {message}
          </Text>
        )}
      </section>

      <section className={`${SERVICE_PANEL_SOFT} space-y-2 p-4`}>
        <Text variant="d2" color="basic-4">
          {t('tips.title')}
        </Text>
        <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-200">
          <li>{t('tips.first')}</li>
          <li>{t('tips.second')}</li>
          <li>{t('tips.third')}</li>
        </ul>
      </section>
    </div>
  );
}
