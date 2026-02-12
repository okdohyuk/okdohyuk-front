'use client';

import React, { useId, useMemo, useState } from 'react';
import { Textarea } from '@components/basic/Textarea';
import { H2, Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

type ListCleanerLabels = {
  title: string;
  description: string;
  inputLabel: string;
  placeholder: string;
  outputLabel: string;
  empty: string;
  options: {
    trim: string;
    dedupe: string;
    sort: string;
    reverse: string;
  };
};

type ListCleanerCardProps = {
  labels: ListCleanerLabels;
};

type OptionsState = {
  trim: boolean;
  dedupe: boolean;
  sort: boolean;
  reverse: boolean;
};

export default function ListCleanerCard({ labels }: ListCleanerCardProps) {
  const [value, setValue] = useState('');
  const [options, setOptions] = useState<OptionsState>({
    trim: true,
    dedupe: true,
    sort: false,
    reverse: false,
  });
  const inputId = useId();
  const outputId = useId();

  const output = useMemo(() => {
    if (!value) return '';
    let lines = value.split(/\r?\n/);

    if (options.trim) {
      lines = lines.map((line) => line.trim());
    }

    if (options.dedupe) {
      const seen = new Set<string>();
      lines = lines.filter((line) => {
        if (seen.has(line)) return false;
        seen.add(line);
        return true;
      });
    }

    if (options.sort) {
      lines = [...lines].sort((a, b) => a.localeCompare(b));
    }

    if (options.reverse) {
      lines = [...lines].reverse();
    }

    return lines.join('\n');
  }, [options, value]);

  const toggle = (key: keyof OptionsState) =>
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));

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
          className="min-h-[100px]"
          placeholder={labels.placeholder}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        {(
          [
            { key: 'trim', label: labels.options.trim },
            { key: 'dedupe', label: labels.options.dedupe },
            { key: 'sort', label: labels.options.sort },
            { key: 'reverse', label: labels.options.reverse },
          ] as const
        ).map((option) => (
          <div key={option.key} className="flex items-center gap-2 text-sm text-zinc-600">
            <input
              id={`list-option-${option.key}`}
              type="checkbox"
              checked={options[option.key]}
              onChange={() => toggle(option.key)}
              className="h-4 w-4 accent-point-2"
            />
            <label htmlFor={`list-option-${option.key}`}>
              <Text variant="d3" color="basic-4">
                {option.label}
              </Text>
            </label>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <label htmlFor={outputId}>
          <Text variant="d2" color="basic-4">
            {labels.outputLabel}
          </Text>
        </label>
        <Textarea
          id={outputId}
          className="min-h-[100px]"
          placeholder={labels.empty}
          value={output}
          readOnly
        />
      </div>
    </section>
  );
}
