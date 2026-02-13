'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Textarea } from '@components/basic/Textarea';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';

type TextCounterClientProps = {
  lng: Language;
};

type TextStat = {
  key: 'characters' | 'charactersNoSpaces' | 'words' | 'lines';
  value: number;
};

function TextCounterClient({ lng }: TextCounterClientProps) {
  const { t } = useTranslation(lng, 'text-counter');
  const textareaId = React.useId();
  const [value, setValue] = useState('');

  const stats = useMemo<TextStat[]>(() => {
    const characters = value.length;
    const charactersNoSpaces = value.replace(/\s/g, '').length;
    const trimmed = value.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const lines = value ? value.split(/\r\n|\r|\n/).length : 0;

    return [
      { key: 'characters', value: characters },
      { key: 'charactersNoSpaces', value: charactersNoSpaces },
      { key: 'words', value: words },
      { key: 'lines', value: lines },
    ];
  }, [value]);

  return (
    <div className="space-y-4">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor={textareaId}
          className="text-sm font-semibold text-zinc-700 dark:text-zinc-200"
        >
          {t('label.input')}
        </label>
        <Textarea
          id={textareaId}
          className="h-36 resize-none"
          placeholder={t('placeholder')}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('helper')}</p>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.key} className={cn(SERVICE_PANEL_SOFT, 'p-4')}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
              {t(`stats.${stat.key}`)}
            </p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default TextCounterClient;
