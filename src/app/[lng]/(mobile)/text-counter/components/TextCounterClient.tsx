'use client';

import React, { useMemo, useState } from 'react';
import { Text } from '@components/basic/Text';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import { RotateCcw } from 'lucide-react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

type TextCounterClientProps = {
  lng: Language;
};

const toLines = (value: string) => {
  if (!value) return 0;
  return value.replace(/\r\n/g, '\n').split('\n').length;
};

export default function TextCounterClient({ lng }: TextCounterClientProps) {
  const { t } = useTranslation(lng, 'text-counter');
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const normalized = text.replace(/\r\n/g, '\n');
    const trimmed = normalized.trim();

    return {
      characters: text.length,
      charactersNoSpaces: text.replace(/\s/g, '').length,
      words: trimmed ? trimmed.split(/\s+/).length : 0,
      lines: toLines(normalized),
      bytes: new TextEncoder().encode(text).length,
    };
  }, [text]);

  const statItems = [
    { key: 'characters', label: t('label.characters'), value: stats.characters },
    {
      key: 'charactersNoSpaces',
      label: t('label.charactersNoSpaces'),
      value: stats.charactersNoSpaces,
    },
    { key: 'words', label: t('label.words'), value: stats.words },
    { key: 'lines', label: t('label.lines'), value: stats.lines },
    { key: 'bytes', label: t('label.bytes'), value: stats.bytes },
  ];

  return (
    <div className="space-y-4">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Text asChild variant="d3" className="font-medium text-fg-3">
            <label htmlFor="text-counter-input">{t('label.input')}</label>
          </Text>
          <Button
            type="button"
            onClick={() => setText('')}
            disabled={!text}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-basic-2 text-fg-3 hover:bg-basic-3"
          >
            <RotateCcw size={14} />
            {t('actions.clear')}
          </Button>
        </div>
        <Textarea
          id="text-counter-input"
          className="min-h-[180px] text-sm"
          placeholder={t('placeholder')}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <Text variant="c1" className="text-fg-5">
          {t('helper')}
        </Text>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {statItems.map((item) => (
          <div
            key={item.key}
            className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-2 p-3')}
          >
            <Text variant="c1" className="uppercase tracking-wide text-fg-5">
              {item.label}
            </Text>
            <Text variant="t3" className="font-bold text-fg-1">
              {item.value.toLocaleString()}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
