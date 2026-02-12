'use client';

import React, { useId, useMemo, useState } from 'react';
import { Textarea } from '@components/basic/Textarea';
import { H2, Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

type TextStatsLabels = {
  title: string;
  description: string;
  inputLabel: string;
  placeholder: string;
  metrics: {
    characters: string;
    words: string;
    lines: string;
    sentences: string;
  };
};

type TextStatsCardProps = {
  labels: TextStatsLabels;
};

export default function TextStatsCard({ labels }: TextStatsCardProps) {
  const [value, setValue] = useState('');
  const inputId = useId();

  const stats = useMemo(() => {
    const trimmed = value.trim();
    const characters = value.length;
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const lines = value ? value.split(/\r?\n/).length : 0;
    const sentences = trimmed ? trimmed.split(/[.!?]+/).filter(Boolean).length : 0;

    return { characters, words, lines, sentences };
  }, [value]);

  return (
    <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
      <div className="space-y-1">
        <H2 className="t-basic-1">{labels.title}</H2>
        <Text variant="d3" color="basic-5">
          {labels.description}
        </Text>
      </div>
      <div className="space-y-2">
        <label htmlFor={inputId}>
          <Text variant="d2" color="basic-4">
            {labels.inputLabel}
          </Text>
        </label>
        <Textarea
          id={inputId}
          className="min-h-[120px]"
          placeholder={labels.placeholder}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/70 p-3 shadow-sm dark:bg-zinc-900/70">
          <Text variant="c1" color="basic-5">
            {labels.metrics.characters}
          </Text>
          <Text variant="t3">{stats.characters}</Text>
        </div>
        <div className="rounded-xl bg-white/70 p-3 shadow-sm dark:bg-zinc-900/70">
          <Text variant="c1" color="basic-5">
            {labels.metrics.words}
          </Text>
          <Text variant="t3">{stats.words}</Text>
        </div>
        <div className="rounded-xl bg-white/70 p-3 shadow-sm dark:bg-zinc-900/70">
          <Text variant="c1" color="basic-5">
            {labels.metrics.lines}
          </Text>
          <Text variant="t3">{stats.lines}</Text>
        </div>
        <div className="rounded-xl bg-white/70 p-3 shadow-sm dark:bg-zinc-900/70">
          <Text variant="c1" color="basic-5">
            {labels.metrics.sentences}
          </Text>
          <Text variant="t3">{stats.sentences}</Text>
        </div>
      </div>
    </section>
  );
}
