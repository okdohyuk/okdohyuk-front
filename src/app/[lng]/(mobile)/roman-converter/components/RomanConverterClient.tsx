'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, RotateCcw } from 'lucide-react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

type RomanConverterClientProps = {
  lng: Language;
};

const ROMAN_NUMERAL_REGEX = /^[IVXLCDM]+$/i;

function toRoman(input: number) {
  if (!Number.isFinite(input) || input <= 0 || input >= 4000) return null;

  const mapping: Array<[number, string]> = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];

  let num = Math.floor(input);

  return mapping
    .map(([value, numeral]) => {
      const count = Math.floor(num / value);
      num %= value;
      return numeral.repeat(count);
    })
    .join('');
}

function fromRoman(raw: string) {
  const roman = raw.trim().toUpperCase();
  if (!roman) return { value: null as number | null, canonical: '' };
  if (!ROMAN_NUMERAL_REGEX.test(roman)) return { value: null as number | null, canonical: roman };

  const values: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  let total = 0;

  for (let i = 0; i < roman.length; i += 1) {
    const current = values[roman[i]];
    const next = values[roman[i + 1]];

    if (!current) return { value: null as number | null, canonical: roman };

    if (next && next > current) {
      total += next - current;
      i += 1;
    } else {
      total += current;
    }
  }

  if (total <= 0 || total >= 4000) return { value: null as number | null, canonical: roman };

  const canonical = toRoman(total);
  if (!canonical) return { value: null as number | null, canonical: roman };

  if (canonical !== roman) return { value: null as number | null, canonical };

  return { value: total, canonical };
}

export default function RomanConverterClient({ lng }: RomanConverterClientProps) {
  const { t } = useTranslation(lng, 'roman-converter');
  const [numberInput, setNumberInput] = useState('');
  const [romanInput, setRomanInput] = useState('');

  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedRoman, setCopiedRoman] = useState(false);

  const parsedNumber = useMemo(() => {
    const trimmed = numberInput.trim();
    if (!trimmed) return { value: null as number | null, error: '' };

    const numeric = Number(trimmed);
    if (!Number.isFinite(numeric) || !Number.isInteger(numeric)) {
      return { value: null as number | null, error: t('error.number.integer') };
    }

    if (numeric <= 0 || numeric >= 4000) {
      return { value: null as number | null, error: t('error.number.range') };
    }

    return { value: numeric, error: '' };
  }, [numberInput, t]);

  const romanOutput = useMemo(() => {
    if (!parsedNumber.value) return '';
    return toRoman(parsedNumber.value) ?? '';
  }, [parsedNumber.value]);

  const parsedRoman = useMemo(() => {
    const roman = romanInput.trim();
    if (!roman) return { value: null as number | null, error: '', canonical: '' };

    const { value, canonical } = fromRoman(roman);

    if (value === null) {
      if (!ROMAN_NUMERAL_REGEX.test(roman)) {
        return { value: null as number | null, error: t('error.roman.characters'), canonical };
      }

      return {
        value: null as number | null,
        error: t('error.roman.invalid'),
        canonical,
      };
    }

    return { value, error: '', canonical };
  }, [romanInput, t]);

  useEffect(() => {
    setCopiedNumber(false);
  }, [romanOutput]);

  useEffect(() => {
    setCopiedRoman(false);
  }, [parsedRoman.value]);

  const handleCopy = async (value: string, onCopied: (copied: boolean) => void) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      onCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy:', error);
    }
  };

  const reset = () => {
    setNumberInput('');
    setRomanInput('');
    setCopiedNumber(false);
    setCopiedRoman(false);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-end">
        <Button type="button" onClick={reset} className="gap-2 px-3 py-2 text-xs">
          <RotateCcw size={16} />
          {t('button.reset')}
        </Button>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-4')}>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper.text')}</p>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-3 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('section.numberToRoman')}
          </h3>
          <Button
            type="button"
            onClick={() => handleCopy(romanOutput, setCopiedNumber)}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!romanOutput}
          >
            {copiedNumber ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copiedNumber ? t('button.copied') : t('button.copy')}
          </Button>
        </div>

        <label htmlFor="roman-number-input" className="text-xs text-gray-500 dark:text-gray-400">
          {t('label.number')}
        </label>
        <Input
          id="roman-number-input"
          inputMode="numeric"
          className="font-mono"
          placeholder={t('placeholder.number')}
          value={numberInput}
          onChange={(event) => setNumberInput(event.target.value)}
        />
        {parsedNumber.error ? (
          <p className="text-xs text-red-600 dark:text-red-400">{parsedNumber.error}</p>
        ) : null}

        <label htmlFor="roman-output" className="text-xs text-gray-500 dark:text-gray-400">
          {t('label.roman')}
        </label>
        <Input
          id="roman-output"
          className="font-mono"
          value={romanOutput}
          readOnly
          placeholder={t('empty')}
        />
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-3 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('section.romanToNumber')}
          </h3>
          <Button
            type="button"
            onClick={() =>
              handleCopy(parsedRoman.value ? String(parsedRoman.value) : '', setCopiedRoman)
            }
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!parsedRoman.value}
          >
            {copiedRoman ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copiedRoman ? t('button.copied') : t('button.copy')}
          </Button>
        </div>

        <label htmlFor="roman-input" className="text-xs text-gray-500 dark:text-gray-400">
          {t('label.roman')}
        </label>
        <Input
          id="roman-input"
          className="font-mono uppercase"
          placeholder={t('placeholder.roman')}
          value={romanInput}
          onChange={(event) => setRomanInput(event.target.value)}
        />

        {parsedRoman.error ? (
          <p className="text-xs text-red-600 dark:text-red-400">
            {parsedRoman.error}{' '}
            {parsedRoman.canonical ? (
              <span className="text-gray-500 dark:text-gray-400">
                {t('helper.canonical', { value: parsedRoman.canonical })}
              </span>
            ) : null}
          </p>
        ) : null}

        <label htmlFor="roman-number-output" className="text-xs text-gray-500 dark:text-gray-400">
          {t('label.number')}
        </label>
        <Input
          id="roman-number-output"
          className="font-mono"
          value={parsedRoman.value ? String(parsedRoman.value) : ''}
          readOnly
          placeholder={t('empty')}
        />
      </div>
    </div>
  );
}
