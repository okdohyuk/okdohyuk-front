'use client';

import React, { useMemo, useState } from 'react';
import { Check, Copy, RefreshCw } from 'lucide-react';

import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Textarea } from '@components/basic/Textarea';
import { cn } from '@utils/cn';
import { H1, Text } from '@components/basic/Text';

type PassphraseGeneratorProps = {
  lng: Language;
};

type PassphraseOptions = {
  capitalize: boolean;
  includeNumber: boolean;
  includeSymbol: boolean;
};

const DEFAULT_WORDS = 4;
const MIN_WORDS = 3;
const MAX_WORDS = 10;
const DEFAULT_SEPARATOR = '-';

const WORD_LIST = [
  'aurora',
  'orbit',
  'maple',
  'ember',
  'velvet',
  'tide',
  'lunar',
  'ripple',
  'frost',
  'nova',
  'shadow',
  'cobalt',
  'petal',
  'summit',
  'glow',
  'mosaic',
  'wander',
  'hollow',
  'signal',
  'harbor',
  'atlas',
  'comet',
  'quartz',
  'echo',
  'breeze',
  'ember',
  'prism',
  'grove',
  'horizon',
  'cascade',
  'ivy',
  'ember',
  'sable',
  'raven',
  'opal',
  'ridge',
  'saffron',
  'cedar',
  'lumen',
  'clover',
  'zenith',
  'ember',
  'scarlet',
  'fjord',
  'harvest',
  'drift',
  'glacier',
  'solace',
  'honey',
  'orbit',
];

const SYMBOLS = ['!', '@', '#', '$', '%', '&', '*'];

const getRandomInt = (max: number) => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
};

const buildPassphrase = (wordCount: number, separator: string, options: PassphraseOptions) => {
  const words = Array.from({ length: wordCount }, () => WORD_LIST[getRandomInt(WORD_LIST.length)]);

  const normalizedWords = options.capitalize
    ? words.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    : words;

  const parts = [...normalizedWords];

  if (options.includeNumber) {
    parts.push(String(getRandomInt(90) + 10));
  }

  if (options.includeSymbol) {
    parts.push(SYMBOLS[getRandomInt(SYMBOLS.length)]);
  }

  return parts.join(separator || DEFAULT_SEPARATOR);
};

export default function PassphraseGenerator({ lng }: PassphraseGeneratorProps) {
  const { t } = useTranslation(lng, 'passphrase-generator');

  const [wordCount, setWordCount] = useState(DEFAULT_WORDS);
  const [separator, setSeparator] = useState(DEFAULT_SEPARATOR);
  const [options, setOptions] = useState<PassphraseOptions>({
    capitalize: true,
    includeNumber: true,
    includeSymbol: false,
  });
  const [passphrase, setPassphrase] = useState('');
  const [copied, setCopied] = useState(false);

  const optionList = useMemo(
    () => [
      { key: 'capitalize', label: t('capitalize') },
      { key: 'includeNumber', label: t('includeNumber') },
      { key: 'includeSymbol', label: t('includeSymbol') },
    ],
    [t],
  );

  const handleWordCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) {
      setWordCount(DEFAULT_WORDS);
      return;
    }

    const normalized = Math.min(Math.max(value, MIN_WORDS), MAX_WORDS);
    setWordCount(normalized);
  };

  const handleSeparatorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSeparator(event.target.value);
  };

  const handleToggle = (key: keyof PassphraseOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = () => {
    const nextPassphrase = buildPassphrase(wordCount, separator, options);
    setPassphrase(nextPassphrase);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!passphrase) return;
    await navigator.clipboard.writeText(passphrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className="space-y-6">
      <H1 className="t-t-1 t-basic-1">{t('title')}</H1>
      <section className="space-y-4 rounded-md bg-basic-7 p-4">
        <div className="space-y-2">
          <label htmlFor="passphrase-word-count" className="t-d-1 t-basic-0">
            {t('wordCount')}
          </label>
          <Input
            id="passphrase-word-count"
            type="number"
            value={wordCount}
            min={MIN_WORDS}
            max={MAX_WORDS}
            onChange={handleWordCountChange}
          />
          <Text variant="d2" color="basic-2">
            {t('tip')}
          </Text>
        </div>

        <div className="space-y-2">
          <label htmlFor="passphrase-separator" className="t-d-1 t-basic-0">
            {t('separator')}
          </label>
          <Input
            id="passphrase-separator"
            type="text"
            value={separator}
            onChange={handleSeparatorChange}
            maxLength={4}
          />
        </div>

        <div className="space-y-2">
          <Text variant="d1" color="basic-1">
            {t('options')}
          </Text>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {optionList.map(({ key, label }) => {
              const inputId = `passphrase-option-${key}`;

              return (
                <div key={key} className="flex items-center gap-2">
                  <input
                    id={inputId}
                    type="checkbox"
                    className="h-4 w-4 accent-point-1"
                    checked={options[key as keyof PassphraseOptions]}
                    onChange={() => handleToggle(key as keyof PassphraseOptions)}
                  />
                  <label htmlFor={inputId} className="t-basic-1">
                    {label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <button type="button" className="button w-full gap-2" onClick={handleGenerate}>
          <RefreshCw className="h-4 w-4" />
          {t('generate')}
        </button>

        <div className="space-y-2">
          <Text variant="d1" color="basic-1">
            {t('resultLabel')}
          </Text>
          <Textarea className="resize-none h-24 w-full" value={passphrase} readOnly />
        </div>

        <button
          type="button"
          className={cn('button w-full gap-2', !passphrase ? 'opacity-50 cursor-not-allowed' : '')}
          onClick={handleCopy}
          disabled={!passphrase}
        >
          <Copy className={cn(copied ? 'hidden' : '')} />
          <Check className={cn(!copied ? 'hidden' : '')} />
          {copied ? t('copied') : t('copy')}
        </button>
      </section>
    </div>
  );
}
