'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, RefreshCcw, Trash2 } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { Text } from '@components/basic/Text';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

type PasswordGeneratorClientProps = {
  lng: Language;
};

type CharsetOption = {
  key: 'lowercase' | 'uppercase' | 'numbers' | 'symbols';
  label: string;
  chars: string;
  enabled: boolean;
};

const MIN_LENGTH = 6;
const MAX_LENGTH = 64;

function getRandomInt(max: number) {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % max;
}

function shuffle(chars: string[]) {
  const result = [...chars];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = getRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function PasswordGeneratorClient({ lng }: PasswordGeneratorClientProps) {
  const { t } = useTranslation(lng, 'password-generator');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: false,
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const optionList = useMemo<CharsetOption[]>(
    () => [
      {
        key: 'lowercase',
        label: t('option.lowercase'),
        chars: 'abcdefghijklmnopqrstuvwxyz',
        enabled: options.lowercase,
      },
      {
        key: 'uppercase',
        label: t('option.uppercase'),
        chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        enabled: options.uppercase,
      },
      {
        key: 'numbers',
        label: t('option.numbers'),
        chars: '0123456789',
        enabled: options.numbers,
      },
      {
        key: 'symbols',
        label: t('option.symbols'),
        chars: '!@#$%^&*()_+-={}[]:;,.<>?/|~',
        enabled: options.symbols,
      },
    ],
    [options.lowercase, options.numbers, options.symbols, options.uppercase, t],
  );

  const sanitizedLength = Math.min(Math.max(length, MIN_LENGTH), MAX_LENGTH);

  const handleGenerate = useCallback(() => {
    const enabledOptions = optionList.filter((option) => option.enabled);

    if (!enabledOptions.length) {
      setError(t('error.noCharset'));
      setPassword('');
      return;
    }

    if (length < MIN_LENGTH || length > MAX_LENGTH) {
      setError(t('error.invalidLength', { min: MIN_LENGTH, max: MAX_LENGTH }));
      setPassword('');
      return;
    }

    if (sanitizedLength < enabledOptions.length) {
      setError(t('error.tooShortForOptions'));
      setPassword('');
      return;
    }

    const pool = enabledOptions.map((option) => option.chars).join('');
    const mandatoryChars = enabledOptions.map((option) => {
      const index = getRandomInt(option.chars.length);
      return option.chars[index];
    });

    const remainingLength = sanitizedLength - mandatoryChars.length;
    const remainingChars = Array.from({ length: remainingLength }, () => {
      const index = getRandomInt(pool.length);
      return pool[index];
    });

    const generated = shuffle([...mandatoryChars, ...remainingChars]).join('');
    setPassword(generated);
    setError(null);
  }, [length, optionList, sanitizedLength, t]);

  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  useEffect(() => {
    setCopied(false);
  }, [password]);

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

  const handleClear = () => {
    setPassword('');
    setCopied(false);
    setError(null);
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <label
            htmlFor="password-length"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.length')}
          </label>
          <Input
            id="password-length"
            type="number"
            min={MIN_LENGTH}
            max={MAX_LENGTH}
            value={length}
            onChange={(event) => setLength(Number(event.target.value))}
          />
          <Text variant="c1" color="basic-5">
            {t('helper.lengthHint', { min: MIN_LENGTH, max: MAX_LENGTH })}
          </Text>
        </div>
        <div className="space-y-3">
          <Text variant="d2" className="font-semibold" color="basic-3">
            {t('label.options')}
          </Text>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {optionList.map((option) => {
              const optionId = `password-option-${option.key}`;
              return (
                <div
                  key={option.key}
                  className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <input
                    id={optionId}
                    type="checkbox"
                    checked={option.enabled}
                    onChange={(event) =>
                      setOptions((prev) => ({ ...prev, [option.key]: event.target.checked }))
                    }
                    className="h-4 w-4 accent-point-1"
                  />
                  <label htmlFor={optionId}>{option.label}</label>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={handleGenerate} className="flex items-center gap-2 px-3">
            <RefreshCcw size={16} />
            {t('button.generate')}
          </Button>
          <Button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            <Trash2 size={16} />
            {t('button.clear')}
          </Button>
        </div>
        {error ? <Text color="basic-4">{error}</Text> : null}
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="password-output"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.output')}
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
          id="password-output"
          className="font-mono"
          value={password}
          readOnly
          placeholder={t('placeholder.output')}
        />
        <Text variant="c1" color="basic-5">
          {t('helper.securityHint')}
        </Text>
      </div>
    </div>
  );
}

export default PasswordGeneratorClient;
