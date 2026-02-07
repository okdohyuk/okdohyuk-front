'use client';

import React from 'react';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';

const getUtf8Bytes = (value: string) => {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(value).length;
  }

  return value.length;
};

const countLines = (value: string) => {
  if (!value) return 0;
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').length;
};

const countWords = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
};

export default function TextCounterClient({ lng }: { lng: Language }) {
  const { t } = useTranslation(lng, 'text-counter');
  const [text, setText] = React.useState('');

  const metrics = React.useMemo(() => {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = countWords(text);
    const lines = countLines(text);
    const bytes = getUtf8Bytes(text);

    return [
      { key: 'characters', value: characters },
      { key: 'charactersNoSpaces', value: charactersNoSpaces },
      { key: 'words', value: words },
      { key: 'lines', value: lines },
      { key: 'bytes', value: bytes },
    ];
  }, [text]);

  const handleClear = () => setText('');
  const handleSample = () => setText(t('sampleText'));

  return (
    <section className="space-y-4">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <Text variant="t3" className="t-basic-1">
              {t('label.input')}
            </Text>
            <Text variant="c1" className="t-basic-1/60">
              {t('helper.input')}
            </Text>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handleSample}>
              {t('button.sample')}
            </Button>
            <Button type="button" onClick={handleClear}>
              {t('button.clear')}
            </Button>
          </div>
        </div>
        <Textarea
          className="min-h-[200px]"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={t('placeholder.input')}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {metrics.map((metric) => (
          <div
            key={metric.key}
            className={cn(SERVICE_PANEL_SOFT, 'flex items-center justify-between px-4 py-3')}
          >
            <Text variant="d2" className="t-basic-1/70">
              {t(`metric.${metric.key}`)}
            </Text>
            <Text variant="t3" className="t-basic-1">
              {metric.value.toLocaleString()}
            </Text>
          </div>
        ))}
      </div>
    </section>
  );
}
