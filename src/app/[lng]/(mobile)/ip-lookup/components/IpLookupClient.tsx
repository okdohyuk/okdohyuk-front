'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Building2,
  Clipboard,
  ClipboardCheck,
  Globe,
  Loader2,
  MapPin,
  Network,
  RefreshCw,
  Router,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Server,
} from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import type { PortInfo } from '~/app/api/ip-lookup/port-scan/route';

interface IpLookupClientProps {
  lng: Language;
}

interface IpData {
  ip: string;
  continent: string;
  continentCode: string;
  country: string;
  countryCode: string;
  regionName: string;
  region: string;
  city: string;
  district: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utcOffset: number;
  currency: string;
  isp: string;
  org: string;
  as: string;
  asName: string;
  hostname: string | null;
  isMobile: boolean;
  isProxy: boolean;
  isHosting: boolean;
}

interface PortScanResult {
  ip: string;
  ports: PortInfo[];
}

const COUNTRY_FLAG_BASE = 'https://flagcdn.com/24x18';

function getFlagUrl(countryCode: string) {
  return `${COUNTRY_FLAG_BASE}/${countryCode.toLowerCase()}.png`;
}

function formatUtcOffset(seconds: number): string {
  const sign = seconds >= 0 ? '+' : '-';
  const abs = Math.abs(seconds);
  const hours = Math.floor(abs / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = ((abs % 3600) / 60).toString().padStart(2, '0');
  return `UTC${sign}${hours}:${minutes}`;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-start sm:gap-4">
      <Text variant="c1" color="basic-5" className="min-w-[120px] shrink-0">
        {label}
      </Text>
      <Text variant="d2" color="basic-2" className="break-all font-medium">
        {value}
      </Text>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'p-4 md:p-5', className)}>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-point-1">{icon}</span>
        <Text variant="t3" color="basic-2" className="font-bold">
          {title}
        </Text>
      </div>
      <div className="divide-y divide-zinc-200/60 dark:divide-zinc-700/60">{children}</div>
    </div>
  );
}

function PortStatusBadge({ status }: { status: PortInfo['status'] }) {
  const styles = {
    open: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    closed: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500',
    filtered: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    scanning: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
        styles[status],
      )}
    >
      {status === 'scanning' && <Loader2 size={10} className="mr-1 animate-spin" />}
      {status.toUpperCase()}
    </span>
  );
}

export default function IpLookupClient({ lng }: IpLookupClientProps) {
  const { t } = useTranslation(lng, 'ip-lookup');

  const [ipData, setIpData] = useState<IpData | null>(null);
  const [ipLoading, setIpLoading] = useState(true);
  const [ipError, setIpError] = useState<string | null>(null);

  const [portData, setPortData] = useState<PortScanResult | null>(null);
  const [portLoading, setPortLoading] = useState(false);
  const [portStarted, setPortStarted] = useState(false);

  const [copied, setCopied] = useState(false);

  const runPortScan = useCallback(async (ip: string) => {
    setPortStarted(true);
    setPortLoading(true);
    setPortData(null);

    try {
      const res = await fetch(`/api/ip-lookup/port-scan?ip=${encodeURIComponent(ip)}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Port scan failed');
      setPortData(data);
    } catch {
      setPortData({ ip, ports: [] });
    } finally {
      setPortLoading(false);
    }
  }, []);

  const fetchIpInfo = useCallback(async () => {
    setIpLoading(true);
    setIpError(null);
    setIpData(null);
    setPortData(null);
    setPortStarted(false);
    setCopied(false);

    try {
      const res = await fetch('/api/ip-lookup', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setIpData(data);
      runPortScan(data.ip);
    } catch (e) {
      setIpError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIpLoading(false);
    }
  }, [runPortScan]);

  useEffect(() => {
    fetchIpInfo();
  }, [fetchIpInfo]);

  const handleCopyIp = async () => {
    if (!ipData?.ip) return;
    try {
      await navigator.clipboard.writeText(ipData.ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Hero: IP Display */}
      <div className={cn(SERVICE_PANEL, 'relative overflow-hidden p-6 md:p-8')}>
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-point-2/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-6 left-0 h-28 w-28 rounded-full bg-violet-400/15 blur-3xl" />

        <div className="relative z-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Text variant="c1" color="basic-5" className="uppercase tracking-widest">
              {t('hero.label')}
            </Text>
            {ipLoading && (
              <div className="flex items-center gap-3">
                <Loader2 size={28} className="animate-spin text-point-1" />
                <Text variant="t3" color="basic-4">
                  {t('hero.loading')}
                </Text>
              </div>
            )}
            {ipError && (
              <Text variant="t2" className="text-red-500 dark:text-red-400">
                {t('hero.error')}
              </Text>
            )}
            {ipData && !ipLoading && (
              <div className="flex flex-wrap items-center gap-3">
                {ipData.countryCode && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getFlagUrl(ipData.countryCode)}
                    alt={ipData.country}
                    width={24}
                    height={18}
                    className="rounded-sm shadow-sm"
                  />
                )}
                <h2 className="font-mono text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 md:text-5xl">
                  {ipData.ip}
                </h2>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {ipData && (
              <Button
                type="button"
                className="flex items-center gap-2 px-3 py-2 text-xs"
                onClick={handleCopyIp}
              >
                {copied ? <ClipboardCheck size={14} /> : <Clipboard size={14} />}
                {copied ? t('actions.copied') : t('actions.copyIp')}
              </Button>
            )}
            <Button
              type="button"
              className="flex items-center gap-2 bg-zinc-200 px-3 py-2 text-xs text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-white"
              onClick={fetchIpInfo}
              disabled={ipLoading}
            >
              <RefreshCw size={14} className={ipLoading ? 'animate-spin' : ''} />
              {t('actions.refresh')}
            </Button>
          </div>
        </div>

        {ipData && !ipLoading && (
          <div className="relative z-10 mt-4 flex flex-wrap gap-2">
            {ipData.isProxy && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                <ShieldAlert size={12} />
                {t('badges.proxy')}
              </span>
            )}
            {ipData.isHosting && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-400">
                <Server size={12} />
                {t('badges.hosting')}
              </span>
            )}
            {ipData.isMobile && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-400">
                <Smartphone size={12} />
                {t('badges.mobile')}
              </span>
            )}
            {!ipData.isProxy && !ipData.isHosting && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                <ShieldCheck size={12} />
                {t('badges.clean')}
              </span>
            )}
          </div>
        )}
      </div>

      {ipData && !ipLoading && (
        <>
          {/* Location */}
          <SectionCard icon={<MapPin size={18} />} title={t('sections.location')}>
            <InfoRow
              label={t('fields.country')}
              value={
                <span className="flex items-center gap-2">
                  {ipData.countryCode && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getFlagUrl(ipData.countryCode)}
                      alt={ipData.country}
                      width={20}
                      height={15}
                      className="rounded-sm"
                    />
                  )}
                  {ipData.country} ({ipData.countryCode})
                </span>
              }
            />
            <InfoRow label={t('fields.continent')} value={ipData.continent} />
            <InfoRow
              label={t('fields.region')}
              value={ipData.regionName || ipData.region || null}
            />
            <InfoRow label={t('fields.city')} value={ipData.city || null} />
            <InfoRow label={t('fields.district')} value={ipData.district || null} />
            <InfoRow label={t('fields.postalCode')} value={ipData.postalCode || null} />
            <InfoRow
              label={t('fields.coordinates')}
              value={
                ipData.latitude && ipData.longitude ? (
                  <a
                    href={`https://www.google.com/maps?q=${ipData.latitude},${ipData.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-point-1 hover:underline"
                  >
                    {ipData.latitude}, {ipData.longitude}
                  </a>
                ) : null
              }
            />
            <InfoRow label={t('fields.timezone')} value={ipData.timezone || null} />
            <InfoRow
              label={t('fields.utcOffset')}
              value={ipData.utcOffset != null ? formatUtcOffset(ipData.utcOffset) : null}
            />
            <InfoRow label={t('fields.currency')} value={ipData.currency || null} />
          </SectionCard>

          {/* Network */}
          <SectionCard icon={<Network size={18} />} title={t('sections.network')}>
            <InfoRow label={t('fields.isp')} value={ipData.isp || null} />
            <InfoRow label={t('fields.org')} value={ipData.org || null} />
            <InfoRow label={t('fields.asn')} value={ipData.as || null} />
            <InfoRow label={t('fields.asnName')} value={ipData.asName || null} />
            <InfoRow label={t('fields.hostname')} value={ipData.hostname || null} />
          </SectionCard>

          {/* Connection Type */}
          <SectionCard icon={<Shield size={18} />} title={t('sections.connectionType')}>
            <InfoRow
              label={t('fields.proxy')}
              value={
                <span
                  className={
                    ipData.isProxy
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }
                >
                  {ipData.isProxy ? t('values.yes') : t('values.no')}
                </span>
              }
            />
            <InfoRow
              label={t('fields.hosting')}
              value={
                <span
                  className={
                    ipData.isHosting
                      ? 'text-violet-600 dark:text-violet-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }
                >
                  {ipData.isHosting ? t('values.yes') : t('values.no')}
                </span>
              }
            />
            <InfoRow
              label={t('fields.mobile')}
              value={
                <span
                  className={
                    ipData.isMobile
                      ? 'text-sky-600 dark:text-sky-400'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }
                >
                  {ipData.isMobile ? t('values.yes') : t('values.no')}
                </span>
              }
            />
          </SectionCard>

          {/* Embedded Google Map */}
          {ipData.latitude && ipData.longitude && (
            <div className={cn(SERVICE_PANEL_SOFT, 'overflow-hidden p-0')}>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-point-1" />
                  <Text variant="t3" color="basic-2" className="font-bold">
                    {t('map.title')}
                  </Text>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${ipData.latitude},${ipData.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-point-1 hover:underline"
                >
                  {t('map.open')}
                </a>
              </div>
              <div className="relative h-64 w-full sm:h-80">
                <iframe
                  title="IP Location Map"
                  src={`https://maps.google.com/maps?q=${ipData.latitude},${ipData.longitude}&z=11&output=embed`}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="px-4 py-2">
                <Text variant="c1" color="basic-5">
                  {t('map.notice')}
                </Text>
              </div>
            </div>
          )}

          {/* Port Scan Section */}
          <div className={cn(SERVICE_PANEL, 'space-y-4 p-4 md:p-5')}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Router size={18} className="text-point-1" />
                <Text variant="t3" color="basic-2" className="font-bold">
                  {t('sections.portScan')}
                </Text>
              </div>
              {!portLoading && ipData?.ip && (
                <Button
                  type="button"
                  className="flex items-center gap-2 bg-zinc-200 px-3 py-2 text-xs text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-white"
                  onClick={() => runPortScan(ipData.ip)}
                >
                  <RefreshCw size={14} />
                  {t('actions.rescan')}
                </Button>
              )}
            </div>

            {portLoading && (
              <div className="flex items-center gap-3 py-4">
                <Loader2 size={20} className="animate-spin text-point-1" />
                <Text variant="d2" color="basic-4">
                  {t('portScan.scanning')}
                </Text>
              </div>
            )}

            {portData && !portLoading && (
              <>
                <div className={cn(SERVICE_PANEL_SOFT, 'p-3')}>
                  <Text variant="c1" color="basic-5">
                    {t('portScan.notice')}
                  </Text>
                </div>

                {/* Summary */}
                <div className="flex flex-wrap gap-3">
                  {(['open', 'closed', 'filtered'] as const).map((status) => {
                    const count = portData.ports.filter((p) => p.status === status).length;
                    const colors = {
                      open: 'text-emerald-600 dark:text-emerald-400',
                      closed: 'text-zinc-500',
                      filtered: 'text-amber-600 dark:text-amber-400',
                    };
                    return (
                      <div key={status} className="flex items-center gap-1">
                        <Text variant="d2" className={cn('font-bold', colors[status])}>
                          {count}
                        </Text>
                        <Text variant="c1" color="basic-5">
                          {t(`portScan.${status}`)}
                        </Text>
                      </div>
                    );
                  })}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200/60 dark:border-zinc-700/60">
                        <th className="pb-2 pr-4 text-left">
                          <Text variant="c1" color="basic-5">
                            {t('portScan.table.port')}
                          </Text>
                        </th>
                        <th className="pb-2 pr-4 text-left">
                          <Text variant="c1" color="basic-5">
                            {t('portScan.table.service')}
                          </Text>
                        </th>
                        <th className="hidden pb-2 pr-4 text-left sm:table-cell">
                          <Text variant="c1" color="basic-5">
                            {t('portScan.table.description')}
                          </Text>
                        </th>
                        <th className="pb-2 text-left">
                          <Text variant="c1" color="basic-5">
                            {t('portScan.table.status')}
                          </Text>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {portData.ports.map((port) => (
                        <tr
                          key={port.port}
                          className="border-b border-zinc-200/40 last:border-0 dark:border-zinc-700/40"
                        >
                          <td className="py-2 pr-4">
                            <Text variant="d2" color="basic-2" className="font-mono font-semibold">
                              {port.port}
                            </Text>
                          </td>
                          <td className="py-2 pr-4">
                            <Text variant="d2" color="basic-3" className="font-medium">
                              {port.service}
                            </Text>
                          </td>
                          <td className="hidden py-2 pr-4 sm:table-cell">
                            <Text variant="c1" color="basic-5">
                              {port.description}
                            </Text>
                          </td>
                          <td className="py-2">
                            <PortStatusBadge status={port.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Disclaimer */}
          <div className={cn(SERVICE_PANEL_SOFT, 'flex items-start gap-3 p-4')}>
            <Building2 size={16} className="mt-0.5 shrink-0 text-zinc-400" />
            <Text variant="c1" color="basic-5" className="leading-relaxed">
              {t('disclaimer')}
            </Text>
          </div>
        </>
      )}
    </div>
  );
}
