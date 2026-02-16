'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, Eraser, Phone } from 'lucide-react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface PhoneNumberFormatterClientProps {
  lng: Language;
}

const normalizeDigits = (value: string) => value.replace(/\D/g, '');

const getPhoneGroups = (digits: string) => {
  if (!digits) return [] as string[];

  if (digits.startsWith('02')) {
    if (digits.length <= 2) return [digits];
    if (digits.length <= 5) return [digits.slice(0, 2), digits.slice(2)];
    if (digits.length === 9) return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5)];
    return [digits.slice(0, 2), digits.slice(2, 6), digits.slice(6, 10)];
  }

  if (/^1\d{3}/.test(digits) && digits.length >= 8) {
    return [digits.slice(0, 4), digits.slice(4, 8)];
  }

  if (digits.length <= 3) return [digits];
  if (digits.length === 4) return [digits];
  if (digits.length === 7) return [digits.slice(0, 3), digits.slice(3)];
  if (digits.length === 8) return [digits.slice(0, 4), digits.slice(4)];
  if (digits.length === 9) return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)];
  if (digits.length === 10) return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)];
  return [digits.slice(0, 3), digits.slice(3, 7), digits.slice(7, 11)];
};

const formatPhoneNumber = (digits: string) => {
  const groups = getPhoneGroups(digits);
  return groups.join('-');
};

const maskPhoneNumber = (digits: string) => {
  const groups = getPhoneGroups(digits);
  if (groups.length <= 1) return groups.join('-');

  if (groups.length === 2) {
    return [groups[0], '*'.repeat(groups[1].length)].join('-');
  }

  const middle = '*'.repeat(groups[1].length);
  return [groups[0], middle, groups[2]].join('-');
};

export default function PhoneNumberFormatterClient({ lng }: PhoneNumberFormatterClientProps) {
  const { t } = useTranslation(lng, 'phone-number-formatter');
  const [value, setValue] = useState('');
  const [copiedField, setCopiedField] = useState<'formatted' | 'masked' | null>(null);

  const digits = useMemo(() => normalizeDigits(value), [value]);
  const formatted = useMemo(() => formatPhoneNumber(digits), [digits]);
  const masked = useMemo(() => maskPhoneNumber(digits), [digits]);

  useEffect(() => {
    setCopiedField(null);
  }, [formatted, masked]);

  const handleCopy = async (text: string, field: 'formatted' | 'masked') => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy phone number:', error);
    }
  };

  const handleClear = () => setValue('');

  const hint = digits ? t('hint', { count: digits.length }) : t('hintEmpty');

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="phone-input"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          {t('label.input')}
        </label>
        <Input
          id="phone-input"
          inputMode="numeric"
          className="font-mono"
          placeholder={t('placeholder')}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Text className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</Text>
          <Button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 px-3 py-1 text-xs"
            disabled={!value}
          >
            <Eraser size={14} />
            {t('button.clear')}
          </Button>
        </div>
        <Text className="text-xs text-zinc-500 dark:text-zinc-400">{t('helper')}</Text>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <Phone size={16} />
            {t('label.formatted')}
          </div>
          <Button
            type="button"
            onClick={() => handleCopy(formatted, 'formatted')}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!formatted}
          >
            {copiedField === 'formatted' ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copiedField === 'formatted' ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
        <Input
          id="phone-output"
          className="font-mono"
          value={formatted}
          readOnly
          placeholder={t('empty.formatted')}
        />
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <Phone size={16} />
            {t('label.masked')}
          </div>
          <Button
            type="button"
            onClick={() => handleCopy(masked, 'masked')}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!masked}
          >
            {copiedField === 'masked' ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copiedField === 'masked' ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
        <Input
          id="phone-masked"
          className="font-mono"
          value={masked}
          readOnly
          placeholder={t('empty.masked')}
        />
      </div>
    </div>
  );
}
