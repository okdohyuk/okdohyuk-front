'use client';

import React, { useMemo, useState } from 'react';
import { cn } from '@utils/cn';
import { Text, H1 } from '@components/basic/Text';
import { SERVICE_PANEL, SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  cidrToSubnetMask,
  getBinarySegments,
  ipToBinary,
  BinarySegment,
} from '../utils/networkCalculator';

interface SubnetGuideProps {
  lng: Language;
}

const EXAMPLE_IP = '192.168.100.0';
const NOTABLE_CIDRS = [8, 16, 24, 30, 32] as const;

interface StatCardProps {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}

function StatCard({ label, value, mono, highlight }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-3 shadow-sm',
        highlight ? 'bg-point-4/60 dark:bg-point-1/20' : 'bg-white/70 dark:bg-zinc-900/70',
      )}
    >
      <Text variant="c1" color="basic-5">
        {label}
      </Text>
      <Text asChild variant="d1">
        <p
          className={cn(
            'mt-1 font-semibold',
            mono && 'font-mono',
            highlight && 'text-point-1 dark:text-point-3',
          )}
        >
          {value}
        </p>
      </Text>
    </div>
  );
}

StatCard.defaultProps = {
  mono: false,
  highlight: false,
};

interface BinaryRowProps {
  segments: BinarySegment[];
  cidr: number;
}

function BinaryRow({ segments, cidr }: BinaryRowProps) {
  return (
    <div className="flex flex-wrap gap-px font-mono text-xs">
      {segments.map((seg) => (
        <React.Fragment key={seg.id}>
          {seg.position > 0 && seg.position % 8 === 0 && <span className="w-1.5" />}
          <span
            className={cn(
              'flex h-6 w-5 items-center justify-center rounded-sm font-bold transition-colors duration-200',
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

export function SubnetGuide({ lng }: SubnetGuideProps) {
  const { t } = useTranslation(lng, 'network-calculator');
  const [cidr, setCidr] = useState(24);

  const data = useMemo(() => {
    const totalHosts = 2 ** (32 - cidr);
    const usableHosts = cidr >= 31 ? totalHosts : Math.max(0, totalHosts - 2);
    const subnetMask = cidrToSubnetMask(cidr);
    const ipBinary = ipToBinary(EXAMPLE_IP);
    const segments = getBinarySegments(ipBinary, cidr);
    return { totalHosts, usableHosts, subnetMask, segments };
  }, [cidr]);

  const maxHosts = 2 ** (32 - 8);
  const hostPercent = Math.max(2, (Math.log2(data.totalHosts + 1) / Math.log2(maxHosts + 1)) * 100);

  const exampleDescriptions: Partial<Record<number, string>> = {
    8: t('guide.examples./8'),
    16: t('guide.examples./16'),
    24: t('guide.examples./24'),
    30: t('guide.examples./30'),
    32: t('guide.examples./32'),
  };

  return (
    <div className="w-full space-y-4">
      {/* Slider panel */}
      <div className={cn(SERVICE_PANEL, 'space-y-6 p-4 md:p-5')}>
        <Text variant="d2" color="basic-5">
          {t('guide.description')}
        </Text>

        <div className="flex items-end gap-3">
          <div className="text-5xl font-black text-point-2 leading-none">/{cidr}</div>
          <div className="space-y-0.5 pb-1">
            <Text variant="c1" color="basic-5">
              {t('guide.networkBits')}: <span className="font-semibold text-point-2">{cidr}</span>
            </Text>
            <Text variant="c1" color="basic-5">
              {t('guide.hostBits')}:{' '}
              <span className="font-semibold text-amber-500">{32 - cidr}</span>
            </Text>
          </div>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min={8}
            max={31}
            value={cidr}
            onChange={(e) => setCidr(Number(e.target.value))}
            className="w-full cursor-pointer accent-point-2"
            aria-label={t('guide.cidrBits')}
          />
          <div className="flex justify-between">
            <Text variant="c1" color="basic-5">
              /8
            </Text>
            <Text variant="c1" color="basic-5">
              /16
            </Text>
            <Text variant="c1" color="basic-5">
              /24
            </Text>
            <Text variant="c1" color="basic-5">
              /31
            </Text>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {NOTABLE_CIDRS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCidr(c)}
              className={cn(
                'rounded-xl px-3 py-1.5 text-sm font-semibold transition-all',
                cidr === c
                  ? 'bg-point-2 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400',
              )}
            >
              /{c}
            </button>
          ))}
        </div>
      </div>

      {/* Stats panel */}
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4 md:p-5')}>
        <H1 className="text-2xl md:text-3xl">{t('guide.networkSize')}</H1>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <StatCard label={t('guide.subnetMask')} value={data.subnetMask} mono />
          <StatCard label={t('guide.totalHosts')} value={data.totalHosts.toLocaleString()} />
          <StatCard
            label={t('guide.usableHosts')}
            value={data.usableHosts.toLocaleString()}
            highlight
          />
        </div>

        <div className="space-y-1.5">
          <Text variant="c1" color="basic-5">
            {t('guide.hostsScale')}
          </Text>
          <div className="h-5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-point-2 to-point-3 transition-all duration-300"
              style={{ width: `${hostPercent}%` }}
            />
          </div>
          <div className="flex justify-between">
            <Text variant="c1" color="basic-5">
              /32 (1)
            </Text>
            <Text variant="c1" color="basic-5">
              /8 (16M+)
            </Text>
          </div>
        </div>
      </div>

      {/* Binary visualization */}
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4 md:p-5')}>
        <Text asChild variant="d2" color="basic-4">
          <p className="font-semibold">{t('guide.binaryRepresentation')}</p>
        </Text>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-point-2" />
            <Text variant="c1" color="basic-5">
              {t('guide.networkBits')} ({cidr})
            </Text>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-amber-400" />
            <Text variant="c1" color="basic-5">
              {t('guide.hostBits')} ({32 - cidr})
            </Text>
          </div>
        </div>

        <div className="space-y-1">
          <Text variant="c1" color="basic-5">
            {EXAMPLE_IP} (binary)
          </Text>
          <BinaryRow segments={data.segments} cidr={cidr} />
        </div>
      </div>

      {/* Common use cases */}
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4 md:p-5')}>
        <Text asChild variant="d2" color="basic-4">
          <p className="font-semibold">{t('guide.commonUsage')}</p>
        </Text>
        <div className="grid gap-2 md:grid-cols-2">
          {NOTABLE_CIDRS.map((c) => {
            const description = exampleDescriptions[c];
            if (!description) return null;
            const isActive = cidr === c;
            const totalAddrs = (2 ** (32 - c)).toLocaleString();
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCidr(c)}
                className={cn(
                  'flex items-start gap-3 rounded-2xl p-3 text-left transition-all',
                  isActive
                    ? 'bg-point-4/80 dark:bg-point-1/20'
                    : 'bg-white/60 hover:bg-white/90 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/70',
                )}
              >
                <span
                  className={cn(
                    'rounded-lg px-2 py-0.5 font-mono text-sm font-bold',
                    isActive
                      ? 'bg-point-2 text-white'
                      : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
                  )}
                >
                  /{c}
                </span>
                <div>
                  <Text variant="d2" className="font-medium">
                    {description}
                  </Text>
                  <Text variant="c1" color="basic-5">
                    {totalAddrs} addrs
                  </Text>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
