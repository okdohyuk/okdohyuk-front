'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Textarea } from '@components/basic/Textarea';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

type TextMetricsClientProps = {
  lng: Language;
};

const getLines = (value: string) => {
  if (!value) return 0;
  return value.replace(/\r\n/g, '\n').split('\n').length;
};

const getParagraphs = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\n{2,}/).length;
};

export default function TextMetricsClient({ lng }: TextMetricsClientProps) {
  const { t } = useTranslation(lng, 'text-metrics');
  const [value, setValue] = useState('');

  const metrics = useMemo(() => {
    const trimmed = value.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const characters = value.length;
    const charactersNoSpace = value.replace(/\s/g, '').length;
    const lines = getLines(value);
    const paragraphs = getParagraphs(value);
    const bytes = typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(value).length : 0;

    return {
      characters,
      charactersNoSpace,
      words,
      lines,
      paragraphs,
      bytes,
    };
  }, [value]);

  const cards = [
    { key: 'characters', value: metrics.characters },
    { key: 'charactersNoSpace', value: metrics.charactersNoSpace },
    { key: 'words', value: metrics.words },
    { key: 'lines', value: metrics.lines },
    { key: 'paragraphs', value: metrics.paragraphs },
    { key: 'bytes', value: metrics.bytes },
  ];

  return (
    <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
      <div className="space-y-2">
        <Textarea
          className="h-40 resize-none"
          placeholder={t('placeholder')}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <p className="t-d-2 t-sub-2">{t('helper')}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <div key={card.key} className={cn(SERVICE_PANEL_SOFT, 'flex flex-col gap-2 p-4')}>
            <span className="t-d-2 t-sub-2">{t(`labels.${card.key}`)}</span>
            <span className="t-h-2 t-basic-1">{card.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
