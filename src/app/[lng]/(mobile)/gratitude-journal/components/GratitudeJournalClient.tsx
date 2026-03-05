'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const DEFAULT_ITEMS = ['', '', ''];

type GratitudeJournalClientProps = {
  lng: Language;
};

export default function GratitudeJournalClient({ lng }: GratitudeJournalClientProps) {
  const { t } = useTranslation(lng, 'gratitude-journal');
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const prompts = t('prompts', { returnObjects: true }) as string[];

  const filledItems = useMemo(() => items.filter((item) => item.trim().length > 0), [items]);

  const updateItem = (index: number, value: string) => {
    setItems((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  };

  const reset = () => {
    setItems(DEFAULT_ITEMS);
  };

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">{t('inputLabel')}</p>
          <div className="space-y-3">
            {items.map((value, index) => {
              const prompt = prompts[index] ?? `${index + 1}`;
              return (
                <div key={prompt} className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500">{prompt}</p>
                  <Textarea
                    className="min-h-[90px] resize-none"
                    placeholder={t('placeholder')}
                    value={value}
                    onChange={(event) => updateItem(index, event.target.value)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-gray-500">{t('tips')}</p>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={reset} className="px-4 bg-gray-200 text-gray-700">
            {t('reset')}
          </Button>
        </div>
      </section>

      <section className={`${SERVICE_PANEL_SOFT} space-y-2 p-4`}>
        <p className="text-sm font-semibold text-gray-700">{t('summaryTitle')}</p>
        {filledItems.length ? (
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
            {filledItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">{t('emptyState')}</p>
        )}
      </section>
    </div>
  );
}
