'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import { H2, Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

type CaseConverterLabels = {
  title: string;
  description: string;
  inputLabel: string;
  placeholder: string;
  outputLabel: string;
  empty: string;
  actions: {
    upper: string;
    lower: string;
    title: string;
    sentence: string;
    swap: string;
  };
  copy: string;
  copied: string;
};

type CaseConverterCardProps = {
  labels: CaseConverterLabels;
};

type CaseMode = 'upper' | 'lower' | 'title' | 'sentence' | 'swap';

const transformText = (value: string, mode: CaseMode) => {
  switch (mode) {
    case 'upper':
      return value.toUpperCase();
    case 'lower':
      return value.toLowerCase();
    case 'title':
      return value.toLowerCase().replace(/(^|\s)\S/g, (char) => char.toUpperCase());
    case 'sentence':
      return value ? `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}` : '';
    case 'swap':
      return value
        .split('')
        .map((char) => {
          if (char.toLowerCase() === char.toUpperCase()) return char;
          return char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase();
        })
        .join('');
    default:
      return value;
  }
};

export default function CaseConverterCard({ labels }: CaseConverterCardProps) {
  const [value, setValue] = useState('');
  const [mode, setMode] = useState<CaseMode>('upper');
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputId = useId();
  const outputId = useId();

  const output = useMemo(() => transformText(value, mode), [value, mode]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => setCopied(false), 1200);
  };

  const actions: { id: CaseMode; label: string }[] = [
    { id: 'upper', label: labels.actions.upper },
    { id: 'lower', label: labels.actions.lower },
    { id: 'title', label: labels.actions.title },
    { id: 'sentence', label: labels.actions.sentence },
    { id: 'swap', label: labels.actions.swap },
  ];

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
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            type="button"
            className={cn('h-9 px-3 text-sm', mode === action.id ? 'bg-point-1' : 'bg-point-2')}
            onClick={() => setMode(action.id)}
          >
            {action.label}
          </Button>
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
      <Button type="button" className="w-full" onClick={handleCopy} disabled={!output}>
        {copied ? labels.copied : labels.copy}
      </Button>
    </section>
  );
}
