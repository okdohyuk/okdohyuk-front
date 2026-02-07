'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, Eraser, Sparkles } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface NumberBaseConverterClientProps {
  lng: Language;
}

type BaseKey = 'decimal' | 'binary' | 'octal' | 'hex';

type BaseField = {
  key: BaseKey;
  base: number;
  inputMode: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  regex: RegExp;
};

const BASE_FIELDS: BaseField[] = [
  { key: 'decimal', base: 10, inputMode: 'numeric', regex: /^\d+$/ },
  { key: 'binary', base: 2, inputMode: 'numeric', regex: /^[01]+$/ },
  { key: 'octal', base: 8, inputMode: 'numeric', regex: /^[0-7]+$/ },
  { key: 'hex', base: 16, inputMode: 'text', regex: /^[0-9a-fA-F]+$/ },
];

const createEmptyValues = () => ({
  decimal: '',
  binary: '',
  octal: '',
  hex: '',
});

export default function NumberBaseConverterClient({ lng }: NumberBaseConverterClientProps) {
  const { t } = useTranslation(lng, 'number-base-converter');
  const [values, setValues] = useState(createEmptyValues);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState<BaseKey | null>(null);

  const labels = useMemo(
    () => ({
      decimal: t('fields.decimal'),
      binary: t('fields.binary'),
      octal: t('fields.octal'),
      hex: t('fields.hex'),
    }),
    [t],
  );

  const placeholders = useMemo(
    () => ({
      decimal: t('placeholders.decimal'),
      binary: t('placeholders.binary'),
      octal: t('placeholders.octal'),
      hex: t('placeholders.hex'),
    }),
    [t],
  );

  const setConvertedValues = (input: BaseKey, rawValue: string) => {
    const trimmed = rawValue.trim();
    setCopiedKey(null);

    if (!trimmed) {
      setValues(createEmptyValues());
      setError('');
      return;
    }

    const field = BASE_FIELDS.find((item) => item.key === input);
    if (!field) return;

    if (!field.regex.test(trimmed)) {
      setValues((prev) => ({
        ...prev,
        [input]: rawValue,
      }));
      setError(t('error.invalid'));
      return;
    }

    try {
      let parsed: bigint;
      switch (input) {
        case 'binary':
          parsed = BigInt(`0b${trimmed}`);
          break;
        case 'octal':
          parsed = BigInt(`0o${trimmed}`);
          break;
        case 'hex':
          parsed = BigInt(`0x${trimmed}`);
          break;
        default:
          parsed = BigInt(trimmed);
          break;
      }

      setValues({
        decimal: parsed.toString(10),
        binary: parsed.toString(2),
        octal: parsed.toString(8),
        hex: parsed.toString(16).toUpperCase(),
      });
      setError('');
    } catch (err) {
      setValues(createEmptyValues());
      setError(t('error.invalid'));
      // eslint-disable-next-line no-console
      console.error('Failed to convert base value:', err);
    }
  };

  const handleCopy = async (key: BaseKey) => {
    if (!values[key]) return;
    try {
      await navigator.clipboard.writeText(values[key]);
      setCopiedKey(key);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy value:', err);
    }
  };

  const handleExample = () => {
    setConvertedValues('decimal', t('example.value'));
  };

  const handleClear = () => {
    setValues(createEmptyValues());
    setError('');
    setCopiedKey(null);
  };

  return (
    <div className="space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text variant="t6" className="text-gray-600 dark:text-gray-300">
          {t('helper')}
        </Text>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={handleExample}>
            <Sparkles size={16} />
            {t('button.example')}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
            <Eraser size={16} />
            {t('button.clear')}
          </Button>
        </div>
        {error ? <Text className="text-sm text-rose-500">{error}</Text> : null}
      </div>

      <div className="space-y-4">
        {BASE_FIELDS.map((field) => (
          <div
            key={field.key}
            className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-3 p-4')}
          >
            <div className="flex items-center justify-between gap-2">
              <Text variant="t6" className="text-gray-700 dark:text-gray-200">
                {labels[field.key]}
              </Text>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCopy(field.key)}
                disabled={!values[field.key]}
                className="gap-1"
              >
                {copiedKey === field.key ? <ClipboardCheck size={14} /> : <Clipboard size={14} />}
                {copiedKey === field.key ? t('button.copied') : t('button.copy')}
              </Button>
            </div>
            <Input
              value={values[field.key]}
              onChange={(event) => setConvertedValues(field.key, event.target.value)}
              placeholder={placeholders[field.key]}
              inputMode={field.inputMode}
              className="font-mono"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
