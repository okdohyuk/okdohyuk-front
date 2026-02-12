'use client';

import React, { useMemo, useState } from 'react';
import { useTranslations } from '~/app/i18n';
import { Language } from '~/app/i18n/settings';
import { Text } from '@components/basic/Text/Text';
import { Textarea } from '@components/basic/Textarea';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import Tag from '@components/basic/Tag';

const DEFAULT_ITEMS = ['Alice', 'Bob', 'Charlie', 'Diana'];

type RandomPickerClientProps = {
  lng: Language;
};

const parseItems = (value: string) =>
  value
    .split(/\n|,/g)
    .map((item) => item.trim())
    .filter(Boolean);

const shuffleItems = (items: string[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export default function RandomPickerClient({ lng }: RandomPickerClientProps) {
  const { t } = useTranslations(lng, 'random-picker');
  const [rawItems, setRawItems] = useState('');
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState('');

  const items = useMemo(() => parseItems(rawItems), [rawItems]);

  const handlePick = () => {
    const normalizedItems = items;

    if (normalizedItems.length === 0) {
      setError(t('error.emptyItems'));
      setResults([]);
      return;
    }

    if (count < 1 || count > normalizedItems.length) {
      setError(t('error.countRange', { count: normalizedItems.length }));
      setResults([]);
      return;
    }

    setError('');
    const picked = shuffleItems(normalizedItems).slice(0, count);
    setResults(picked);
  };

  const handleCopy = async () => {
    if (results.length === 0) return;
    await navigator.clipboard.writeText(results.join('\n'));
  };

  const handleClear = () => {
    setRawItems('');
    setResults([]);
    setCount(1);
    setError('');
  };

  const handleExample = () => {
    setRawItems(DEFAULT_ITEMS.join('\n'));
    setCount(2);
    setResults([]);
    setError('');
  };

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <Text asChild variant="d2" color="basic-2">
          <label htmlFor="items">{t('label.items')}</label>
        </Text>
        <Textarea
          id="items"
          value={rawItems}
          onChange={(event) => setRawItems(event.target.value)}
          placeholder={t('placeholder.items')}
          rows={6}
        />
        <Text variant="c1" color="basic-6">
          {t('helper.items')}
        </Text>
      </section>

      <section className="space-y-2">
        <Text asChild variant="d2" color="basic-2">
          <label htmlFor="count">{t('label.count')}</label>
        </Text>
        <Input
          id="count"
          type="number"
          min={1}
          max={Math.max(items.length, 1)}
          value={count}
          onChange={(event) => setCount(Number(event.target.value))}
        />
        <Text variant="c1" color="basic-6">
          {t('helper.count', { count: Math.max(items.length, 1) })}
        </Text>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handlePick}>
          {t('button.pick')}
        </Button>
        <Button type="button" onClick={handleCopy} disabled={results.length === 0}>
          {t('button.copy')}
        </Button>
        <Button type="button" onClick={handleClear}>
          {t('button.clear')}
        </Button>
        <Button type="button" onClick={handleExample}>
          {t('button.example')}
        </Button>
      </div>

      {error ? (
        <Text variant="d3" color="basic-5">
          {error}
        </Text>
      ) : null}

      <section className="space-y-2">
        <Text variant="d2" color="basic-2">
          {t('result.title')}
        </Text>
        {results.length === 0 ? (
          <Text variant="c1" color="basic-6">
            {t('result.empty')}
          </Text>
        ) : (
          <div className="flex flex-wrap gap-2">
            {results.map((item) => (
              <Tag key={item} tag={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
