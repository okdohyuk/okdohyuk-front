'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Clipboard, ClipboardCheck, Clock, Eraser } from 'lucide-react';
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

type CopyField = 'seconds' | 'milliseconds' | 'iso' | null;

type TimestampConverterClientProps = {
  lng: Language;
};

const pad = (value: number) => String(value).padStart(2, '0');

const formatLocal = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

const isIntegerString = (value: string) => /^-?\d+$/.test(value.trim());

function TimestampConverterClient({ lng }: TimestampConverterClientProps) {
  const { t } = useTranslation(lng, 'timestamp-converter');
  const [unixSeconds, setUnixSeconds] = useState('');
  const [unixMilliseconds, setUnixMilliseconds] = useState('');
  const [isoValue, setIsoValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<CopyField>(null);

  useEffect(() => {
    if (!copiedField) return undefined;
    const timer = window.setTimeout(() => setCopiedField(null), 1500);
    return () => window.clearTimeout(timer);
  }, [copiedField]);

  const applyDate = useCallback((date: Date) => {
    const time = date.getTime();
    setUnixSeconds(Math.floor(time / 1000).toString());
    setUnixMilliseconds(time.toString());
    setIsoValue(formatLocal(date));
    setError(null);
  }, []);

  const handleCopy = async (value: string, field: CopyField) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
    } catch (copyError) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy value:', copyError);
    }
  };

  const handleSecondsChange = (value: string) => {
    setUnixSeconds(value);
    setCopiedField(null);

    if (!value.trim()) {
      setUnixMilliseconds('');
      setIsoValue('');
      setError(null);
      return;
    }

    if (!isIntegerString(value)) {
      setError(t('error.invalidSeconds'));
      return;
    }

    const date = new Date(Number(value) * 1000);
    if (Number.isNaN(date.getTime())) {
      setError(t('error.invalidSeconds'));
      return;
    }

    applyDate(date);
  };

  const handleMillisecondsChange = (value: string) => {
    setUnixMilliseconds(value);
    setCopiedField(null);

    if (!value.trim()) {
      setUnixSeconds('');
      setIsoValue('');
      setError(null);
      return;
    }

    if (!isIntegerString(value)) {
      setError(t('error.invalidMilliseconds'));
      return;
    }

    const date = new Date(Number(value));
    if (Number.isNaN(date.getTime())) {
      setError(t('error.invalidMilliseconds'));
      return;
    }

    applyDate(date);
  };

  const handleIsoChange = (value: string) => {
    setIsoValue(value);
    setCopiedField(null);

    if (!value.trim()) {
      setUnixSeconds('');
      setUnixMilliseconds('');
      setError(null);
      return;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      setError(t('error.invalidIso'));
      return;
    }

    applyDate(date);
  };

  const handleNow = () => {
    applyDate(new Date());
  };

  const handleClear = () => {
    setUnixSeconds('');
    setUnixMilliseconds('');
    setIsoValue('');
    setError(null);
    setCopiedField(null);
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-5 p-4')}>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="timestamp-unix-seconds"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.unixSeconds')}
          </label>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Input
              id="timestamp-unix-seconds"
              className="font-mono"
              placeholder={t('placeholder.unixSeconds')}
              value={unixSeconds}
              onChange={(event) => handleSecondsChange(event.target.value)}
            />
            <Button
              type="button"
              onClick={() => handleCopy(unixSeconds, 'seconds')}
              className="flex items-center gap-2 px-3 py-2 text-xs"
              disabled={!unixSeconds}
            >
              {copiedField === 'seconds' ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
              {copiedField === 'seconds' ? t('button.copied') : t('button.copy')}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="timestamp-unix-ms"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.unixMilliseconds')}
          </label>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Input
              id="timestamp-unix-ms"
              className="font-mono"
              placeholder={t('placeholder.unixMilliseconds')}
              value={unixMilliseconds}
              onChange={(event) => handleMillisecondsChange(event.target.value)}
            />
            <Button
              type="button"
              onClick={() => handleCopy(unixMilliseconds, 'milliseconds')}
              className="flex items-center gap-2 px-3 py-2 text-xs"
              disabled={!unixMilliseconds}
            >
              {copiedField === 'milliseconds' ? (
                <ClipboardCheck size={16} />
              ) : (
                <Clipboard size={16} />
              )}
              {copiedField === 'milliseconds' ? t('button.copied') : t('button.copy')}
            </Button>
          </div>
        </div>

        <div className={cn(SERVICE_CARD_INTERACTIVE, 'rounded-2xl border p-4')}>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="timestamp-iso"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.isoLocal')}
            </label>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <Input
                id="timestamp-iso"
                type="datetime-local"
                step={1}
                className="font-mono"
                value={isoValue}
                onChange={(event) => handleIsoChange(event.target.value)}
              />
              <Button
                type="button"
                onClick={() => handleCopy(isoValue, 'iso')}
                className="flex items-center gap-2 px-3 py-2 text-xs"
                disabled={!isoValue}
              >
                {copiedField === 'iso' ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
                {copiedField === 'iso' ? t('button.copied') : t('button.copy')}
              </Button>
            </div>
            <Text variant="c1" color="basic-5" className="mt-1">
              {t('helper.localNotice')}
            </Text>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleNow} className="flex items-center gap-2">
            <Clock size={16} />
            {t('button.now')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="flex items-center gap-2"
          >
            <Eraser size={16} />
            {t('button.clear')}
          </Button>
        </div>

        {error ? (
          <Text variant="c1" color="basic-5" className="text-red-500">
            {error}
          </Text>
        ) : null}
      </div>
    </div>
  );
}

export default TimestampConverterClient;
