'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Text } from '@components/basic/Text';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

type OrderShufflerClientProps = {
  lng: Language;
};

const shuffleItems = (items: string[]) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const parseItems = (value: string) =>
  value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

export default function OrderShufflerClient({ lng }: OrderShufflerClientProps) {
  const { t } = useTranslation(lng, 'order-shuffler');
  const [rawItems, setRawItems] = useState('');
  const [shuffledItems, setShuffledItems] = useState<Array<{ id: string; value: string }>>([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const parsedItems = useMemo(() => parseItems(rawItems), [rawItems]);

  const handleShuffle = () => {
    const items = parseItems(rawItems);
    if (items.length < 2) {
      setError(t('validation.min'));
      setStatus('');
      setShuffledItems([]);
      return;
    }
    setError('');
    setStatus('');
    setShuffledItems(
      shuffleItems(items).map((item) => ({
        id: globalThis.crypto?.randomUUID?.() ?? `${item}-${Date.now()}`,
        value: item,
      })),
    );
  };

  const handleClear = () => {
    setRawItems('');
    setShuffledItems([]);
    setError('');
    setStatus('');
  };

  const handleExample = () => {
    setRawItems(t('example.text'));
    setShuffledItems([]);
    setError('');
    setStatus('');
  };

  const handleCopy = async () => {
    if (shuffledItems.length === 0) {
      setStatus(t('toast.noResult'));
      return;
    }
    const payload = shuffledItems.map((item, index) => `${index + 1}. ${item.value}`).join('\n');
    try {
      await navigator.clipboard.writeText(payload);
      setStatus(t('toast.copied'));
    } catch (copyError) {
      setStatus(String(copyError));
    }
  };

  return (
    <div className="space-y-4">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="space-y-1">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {t('label.items')}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</Text>
        </div>
        <Textarea
          value={rawItems}
          placeholder={t('placeholder')}
          onChange={(event) => {
            setRawItems(event.target.value);
            setError('');
            setStatus('');
          }}
          className="min-h-[140px] text-sm"
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" className="px-3 py-2 text-sm" onClick={handleShuffle}>
            {t('button.shuffle')}
          </Button>
          <Button
            type="button"
            className="px-3 py-2 text-sm bg-gray-500 hover:bg-gray-600"
            onClick={handleExample}
          >
            {t('button.example')}
          </Button>
          <Button
            type="button"
            className="px-3 py-2 text-sm bg-gray-400 hover:bg-gray-500"
            onClick={handleClear}
          >
            {t('button.clear')}
          </Button>
          <Button
            type="button"
            className="px-3 py-2 text-sm bg-point-1 hover:bg-point-2"
            onClick={handleCopy}
          >
            {t('button.copy')}
          </Button>
        </div>
        {error ? <Text className="text-xs text-red-500">{error}</Text> : null}
        {status ? <Text className="text-xs text-point-1">{status}</Text> : null}
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="space-y-1">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {t('result.title')}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {t('result.count', { count: parsedItems.length })}
          </Text>
        </div>
        {shuffledItems.length > 0 ? (
          <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
            {shuffledItems.map((item, index) => (
              <li
                key={item.id}
                className="flex items-center gap-2 rounded-lg border border-gray-200/70 bg-white/60 px-3 py-2 dark:border-gray-700/70 dark:bg-gray-900/60"
              >
                <span className="text-xs font-semibold text-point-1">{index + 1}</span>
                <span>{item.value}</span>
              </li>
            ))}
          </ol>
        ) : (
          <Text className="text-sm text-gray-500 dark:text-gray-400">{t('result.empty')}</Text>
        )}
      </div>
    </div>
  );
}
