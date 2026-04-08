'use client';

import React, { useMemo, useState } from 'react';
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
  calculateSubnet,
  cidrToSubnetMask,
  getBinarySegments,
  isValidCidr,
  isValidIp,
  isValidSubnetMask,
  subnetMaskToCidr,
  COMMON_CIDR_OPTIONS,
  BinarySegment,
} from '../utils/networkCalculator';

interface IpSubnetCalculatorProps {
  lng: Language;
}

interface ResultCardProps {
  label: string;
  value: string;
}

function ResultCard({ label, value }: ResultCardProps) {
  return (
    <div className="rounded-2xl bg-white/70 p-3 shadow-sm dark:bg-zinc-900/70">
      <Text variant="c1" color="basic-5">
        {label}
      </Text>
      <Text asChild variant="d1">
        <p className="mt-1 font-semibold break-all">{value}</p>
      </Text>
    </div>
  );
}

interface BinaryDisplayProps {
  segments: BinarySegment[];
  cidr: number;
}

function BinaryDisplay({ segments, cidr }: BinaryDisplayProps) {
  return (
    <div className="flex flex-wrap gap-px font-mono text-xs">
      {segments.map((seg) => (
        <React.Fragment key={seg.id}>
          {seg.position > 0 && seg.position % 8 === 0 && <span className="w-1.5" />}
          <span
            className={cn(
              'flex h-6 w-5 items-center justify-center rounded-sm font-bold transition-colors',
              seg.type === 'network'
                ? 'bg-point-4 text-point-1 dark:bg-point-1/30 dark:text-point-3'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
              seg.position === cidr - 1 && 'border-r-2 border-point-1',
            )}
          >
            {seg.bit}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

export function IpSubnetCalculator({ lng }: IpSubnetCalculatorProps) {
  const { t } = useTranslation(lng, 'network-calculator');

  const [ip, setIp] = useState('192.168.1.10');
  const [mask, setMask] = useState('255.255.255.0');
  const [error, setError] = useState<string | null>(null);

  const result = useMemo(() => {
    if (!ip || !mask) return null;
    if (!isValidIp(ip)) return null;
    if (!isValidSubnetMask(mask)) return null;
    const cidr = subnetMaskToCidr(mask);
    if (!isValidCidr(cidr)) return null;
    return calculateSubnet(ip, cidr);
  }, [ip, mask]);

  const handleCidrSelect = (value: string) => {
    const cidr = Number(value);
    setMask(cidrToSubnetMask(cidr));
    setError(null);
  };

  const handleMaskChange = (value: string) => {
    setMask(value);
    setError(null);
    if (value && !isValidSubnetMask(value)) {
      setError(t('messages.invalidMask'));
    }
  };

  const handleIpChange = (value: string) => {
    setIp(value);
    setError(null);
    if (value && !isValidIp(value)) {
      setError(t('messages.invalidIp'));
    }
  };

  const handleClear = () => {
    setIp('');
    setMask('');
    setError(null);
  };

  const ipSegments = result ? getBinarySegments(result.ipBinary, result.cidr) : null;
  const maskSegments = result ? getBinarySegments(result.maskBinary, result.cidr) : null;

  return (
    <div className="w-full space-y-4">
      {/* Input panel */}
      <div className={cn(SERVICE_PANEL, 'space-y-4 p-4 md:p-5')}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Text asChild variant="d2" color="basic-4">
              <label htmlFor="ip-input">{t('ipSubnet.ipAddress')}</label>
            </Text>
            <Input
              id="ip-input"
              type="text"
              value={ip}
              onChange={(e) => handleIpChange(e.target.value)}
              placeholder={t('ipSubnet.ipPlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Text asChild variant="d2" color="basic-4">
              <label htmlFor="mask-input">{t('ipSubnet.subnetMask')}</label>
            </Text>
            <Input
              id="mask-input"
              type="text"
              value={mask}
              onChange={(e) => handleMaskChange(e.target.value)}
              placeholder={t('ipSubnet.subnetPlaceholder')}
            />
            <div className="space-y-1">
              <Text variant="c1" color="basic-5">
                {t('ipSubnet.orCidr')}
              </Text>
              <Select onValueChange={handleCidrSelect}>
                <SelectTrigger aria-label={t('ipSubnet.selectCidr')}>
                  <SelectValue placeholder={t('ipSubnet.selectCidr')} />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_CIDR_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {error && (
          <Text variant="d2" className="text-red-500 dark:text-red-400">
            {error}
          </Text>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            className="px-4 py-2 text-sm bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-white"
            onClick={handleClear}
          >
            {t('ipSubnet.clear')}
          </Button>
        </div>
      </div>

      {/* Results panel */}
      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4 md:p-5')}>
        <H1 className="text-2xl md:text-3xl">{t('ipSubnet.results')}</H1>

        {!result && !error && (
          <Text variant="d2" color="basic-5">
            {t('ipSubnet.resultsEmpty')}
          </Text>
        )}

        {result && (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <ResultCard label={t('ipSubnet.networkAddress')} value={result.networkAddress} />
              <ResultCard label={t('ipSubnet.broadcastAddress')} value={result.broadcastAddress} />
              <ResultCard label={t('ipSubnet.subnetMaskLabel')} value={result.subnetMask} />
              <ResultCard label={t('ipSubnet.cidrLabel')} value={`/${result.cidr}`} />
              <ResultCard label={t('ipSubnet.firstHost')} value={result.firstHost} />
              <ResultCard label={t('ipSubnet.lastHost')} value={result.lastHost} />
              <ResultCard
                label={t('ipSubnet.totalHosts')}
                value={result.totalHosts.toLocaleString()}
              />
              <ResultCard
                label={t('ipSubnet.usableHosts')}
                value={result.usableHosts.toLocaleString()}
              />
            </div>
          </div>
        )}
      </div>

      {/* Binary visualization panel */}
      {result && ipSegments && maskSegments && (
        <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4 md:p-5')}>
          <Text asChild variant="d2" color="basic-4">
            <p className="font-semibold">{t('ipSubnet.binaryVisualization')}</p>
          </Text>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-point-2" />
              <Text variant="c1" color="basic-5">
                {t('ipSubnet.networkBits')}
              </Text>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-amber-400" />
              <Text variant="c1" color="basic-5">
                {t('ipSubnet.hostBits')}
              </Text>
            </div>
          </div>

          <div className="space-y-1">
            <Text variant="c1" color="basic-5">
              {t('ipSubnet.ipBinary')}
            </Text>
            <BinaryDisplay segments={ipSegments} cidr={result.cidr} />
          </div>

          <div className="space-y-1">
            <Text variant="c1" color="basic-5">
              {t('ipSubnet.maskBinary')}
            </Text>
            <BinaryDisplay segments={maskSegments} cidr={result.cidr} />
          </div>
        </div>
      )}
    </div>
  );
}
