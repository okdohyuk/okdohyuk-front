'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck } from 'lucide-react';
import { cn } from '@utils/cn';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { Text, H1 } from '@components/basic/Text';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  calculateWildcard,
  cidrToSubnetMask,
  isValidSubnetMask,
  subnetMaskToCidr,
  COMMON_CIDR_OPTIONS,
} from '../utils/networkCalculator';

interface WildcardCalculatorProps {
  lng: Language;
}

export function WildcardCalculator({ lng }: WildcardCalculatorProps) {
  const { t } = useTranslation(lng, 'network-calculator');

  const [mask, setMask] = useState('255.255.255.0');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!mask) return null;
    if (!isValidSubnetMask(mask)) return null;
    const wildcard = calculateWildcard(mask);
    const cidr = subnetMaskToCidr(mask);
    return { wildcard, cidr, subnetMask: mask };
  }, [mask]);

  const handleMaskChange = (value: string) => {
    setMask(value);
    setCopied(false);
    setError(null);
    if (value && !isValidSubnetMask(value)) {
      setError(t('messages.invalidMask'));
    }
  };

  const handleCidrSelect = (value: string) => {
    setMask(cidrToSubnetMask(Number(value)));
    setCopied(false);
    setError(null);
  };

  const handleClear = () => {
    setMask('');
    setError(null);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.wildcard);
      setCopied(true);
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Input panel */}
      <div className={cn(SERVICE_PANEL, 'space-y-4 p-4 md:p-5')}>
        <Text variant="d2" color="basic-5">
          {t('wildcard.description')}
        </Text>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Text asChild variant="d2" color="basic-4">
              <label htmlFor="wc-mask">{t('wildcard.subnetMask')}</label>
            </Text>
            <Input
              id="wc-mask"
              type="text"
              value={mask}
              onChange={(e) => handleMaskChange(e.target.value)}
              placeholder={t('wildcard.subnetPlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Text asChild variant="d2" color="basic-4">
              <label htmlFor="wc-cidr">{t('wildcard.orCidr')}</label>
            </Text>
            <Select onValueChange={handleCidrSelect}>
              <SelectTrigger id="wc-cidr" aria-label={t('wildcard.orCidr')}>
                <SelectValue placeholder="Select CIDR" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_CIDR_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    /{opt.cidr} — {cidrToSubnetMask(opt.cidr)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <Text variant="d2" className="text-red-500 dark:text-red-400">
            {error}
          </Text>
        )}

        <Button
          type="button"
          className="px-4 py-2 text-sm bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-white"
          onClick={handleClear}
        >
          {t('wildcard.clear')}
        </Button>
      </div>

      {/* Results panel */}
      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4 md:p-5')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <H1 className="text-2xl md:text-3xl">{t('wildcard.results')}</H1>
          {result && (
            <Button
              type="button"
              className="flex items-center gap-2 px-3 py-2 text-xs"
              onClick={handleCopy}
            >
              {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
              {copied ? t('messages.copied') : t('actions.copy')}
            </Button>
          )}
        </div>

        {!result && !error && (
          <Text variant="d2" color="basic-5">
            {t('wildcard.resultsEmpty')}
          </Text>
        )}

        {result && (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-white/70 p-3 shadow-sm dark:bg-zinc-900/70">
                <Text variant="c1" color="basic-5">
                  {t('wildcard.inputMask')}
                </Text>
                <Text asChild variant="d1">
                  <p className="mt-1 font-mono font-semibold">{result.subnetMask}</p>
                </Text>
              </div>
              <div className="rounded-2xl bg-point-4/60 p-3 shadow-sm dark:bg-point-1/20">
                <Text variant="c1" color="basic-5">
                  {t('wildcard.wildcardMask')}
                </Text>
                <Text asChild variant="t3">
                  <p className="mt-1 font-mono font-bold text-point-1 dark:text-point-3">
                    {result.wildcard}
                  </p>
                </Text>
              </div>
              <div className="rounded-2xl bg-white/70 p-3 shadow-sm dark:bg-zinc-900/70">
                <Text variant="c1" color="basic-5">
                  {t('wildcard.cidrNotation')}
                </Text>
                <Text asChild variant="d1">
                  <p className="mt-1 font-mono font-semibold">/{result.cidr}</p>
                </Text>
              </div>
            </div>

            {/* Usage example */}
            <div className={cn(SERVICE_PANEL_SOFT, 'p-3')}>
              <Text asChild variant="c1" color="basic-5">
                <p className="mb-1 font-semibold">{t('wildcard.usage')}</p>
              </Text>
              <code className="block rounded-lg bg-zinc-100 px-3 py-2 font-mono text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                {t('wildcard.usageText', { wildcard: result.wildcard })}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
