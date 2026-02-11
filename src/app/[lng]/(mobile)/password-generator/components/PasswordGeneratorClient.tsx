'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, RefreshCcw } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface PasswordGeneratorClientProps {
  lng: Language;
}

const MIN_LENGTH = 4;
const MAX_LENGTH = 64;

const CHARACTER_POOLS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

export default function PasswordGeneratorClient({ lng }: PasswordGeneratorClientProps) {
  const { t } = useTranslation(lng, 'password-generator');
  const [length, setLength] = useState(16);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const selectedPools = useMemo(() => {
    const pools: string[] = [];
    if (includeLowercase) pools.push(CHARACTER_POOLS.lowercase);
    if (includeUppercase) pools.push(CHARACTER_POOLS.uppercase);
    if (includeNumbers) pools.push(CHARACTER_POOLS.numbers);
    if (includeSymbols) pools.push(CHARACTER_POOLS.symbols);
    return pools;
  }, [includeLowercase, includeUppercase, includeNumbers, includeSymbols]);

  const characterPool = useMemo(() => selectedPools.join(''), [selectedPools]);
  const minRequired = selectedPools.length;
  const isLengthTooShort = length < minRequired && minRequired > 0;
  const canGenerate = characterPool.length > 0 && !isLengthTooShort;

  useEffect(() => {
    setCopied(false);
  }, [password]);

  useEffect(() => {
    setError('');
  }, [length, includeLowercase, includeUppercase, includeNumbers, includeSymbols]);

  const getRandomInt = (max: number) => {
    if (max <= 0) return 0;
    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      return array[0] % max;
    }
    return Math.floor(Math.random() * max);
  };

  const generatePassword = () => {
    if (!characterPool) {
      setError(t('error.noOptions'));
      return;
    }

    if (isLengthTooShort) {
      setError(t('error.tooShort', { count: minRequired }));
      return;
    }

    const requiredChars = selectedPools.map((pool) => {
      const index = getRandomInt(pool.length);
      return pool[index];
    });

    const remainingCount = Math.max(length - requiredChars.length, 0);
    const remainingChars = Array.from({ length: remainingCount }, () => {
      const index = getRandomInt(characterPool.length);
      return characterPool[index];
    });

    const combined = [...requiredChars, ...remainingChars];
    for (let i = combined.length - 1; i > 0; i -= 1) {
      const j = getRandomInt(i + 1);
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    setPassword(combined.join(''));
    setError('');
  };

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch (copyError) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy password:', copyError);
    }
  };

  const handleLengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) return;
    setLength(Math.min(Math.max(value, MIN_LENGTH), MAX_LENGTH));
  };

  return (
    <div className="space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="password-length"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.length')}
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('helper.range', { min: MIN_LENGTH, max: MAX_LENGTH })}
            </span>
          </div>
          <Input
            id="password-length"
            type="number"
            min={MIN_LENGTH}
            max={MAX_LENGTH}
            value={length}
            onChange={handleLengthChange}
            className="text-center"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('label.options')}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                id="password-option-lowercase"
                type="checkbox"
                checked={includeLowercase}
                onChange={() => setIncludeLowercase((prev) => !prev)}
                className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
              />
              <label htmlFor="password-option-lowercase">{t('options.lowercase')}</label>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                id="password-option-uppercase"
                type="checkbox"
                checked={includeUppercase}
                onChange={() => setIncludeUppercase((prev) => !prev)}
                className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
              />
              <label htmlFor="password-option-uppercase">{t('options.uppercase')}</label>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                id="password-option-numbers"
                type="checkbox"
                checked={includeNumbers}
                onChange={() => setIncludeNumbers((prev) => !prev)}
                className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
              />
              <label htmlFor="password-option-numbers">{t('options.numbers')}</label>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                id="password-option-symbols"
                type="checkbox"
                checked={includeSymbols}
                onChange={() => setIncludeSymbols((prev) => !prev)}
                className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
              />
              <label htmlFor="password-option-symbols">{t('options.symbols')}</label>
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={generatePassword}
          disabled={!canGenerate}
          className="flex w-full items-center justify-center gap-2"
        >
          <RefreshCcw size={16} />
          {password ? t('button.regenerate') : t('button.generate')}
        </Button>

        {error ? (
          <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper.note')}</p>
        )}
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="password-result"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.result')}
          </label>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!password}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
        <Input
          id="password-result"
          className="font-mono"
          value={password}
          readOnly
          placeholder={t('empty')}
        />
      </div>
    </div>
  );
}
