'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, RefreshCcw } from 'lucide-react';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

const HASH_ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;

type HashAlgorithm = (typeof HASH_ALGORITHMS)[number];

type HashGeneratorClientProps = {
  lng: Language;
};

const SAMPLE_TEXT = 'The quick brown fox jumps over the lazy dog.';

function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export default function HashGeneratorClient({ lng }: HashGeneratorClientProps) {
  const { t } = useTranslation(lng, 'hash-generator');
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const hasInput = useMemo(() => input.trim().length > 0, [input]);

  useEffect(() => {
    setCopied(false);
  }, [output]);

  useEffect(() => {
    let isActive = true;

    const run = async () => {
      if (!hasInput) {
        setOutput('');
        setError(null);
        return;
      }

      if (!window.crypto?.subtle) {
        setOutput('');
        setError(t('error.unsupported'));
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        const digest = await window.crypto.subtle.digest(algorithm, data);
        if (!isActive) return;
        setOutput(bufferToHex(digest));
      } catch (err) {
        if (!isActive) return;
        setOutput('');
        setError(t('error.failed'));
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    run();

    return () => {
      isActive = false;
    };
  }, [algorithm, hasInput, input, t]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy hash:', err);
    }
  };

  const handleClear = () => {
    setInput('');
  };

  const handleSample = () => {
    setInput(SAMPLE_TEXT);
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <label
            htmlFor="hash-input"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.input')}
          </label>
          <Textarea
            id="hash-input"
            rows={5}
            className="font-mono"
            placeholder={t('placeholder')}
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="hash-algorithm"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.algorithm')}
          </label>
          <Select value={algorithm} onValueChange={(value) => setAlgorithm(value as HashAlgorithm)}>
            <SelectTrigger id="hash-algorithm">
              <SelectValue placeholder={t('placeholderAlgorithm')} />
            </SelectTrigger>
            <SelectContent>
              {HASH_ALGORITHMS.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSample}
            className="text-xs"
          >
            {t('button.sample')}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleClear} className="text-xs">
            <RefreshCcw className="mr-2 h-3.5 w-3.5" />
            {t('button.clear')}
          </Button>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label
            htmlFor="hash-output"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.output')}
          </label>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!output}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
        <Textarea
          id="hash-output"
          rows={4}
          className="font-mono"
          value={output}
          readOnly
          placeholder={isLoading ? t('status.loading') : t('empty')}
        />
        {error ? (
          <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('helperOutput')}</p>
        )}
      </div>
    </div>
  );
}
