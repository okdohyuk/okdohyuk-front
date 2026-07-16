'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@utils/cn';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/basic/Table';
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
import GoogleAd from '@components/google/GoogleAd';
import { useToolTracking } from '@hooks/analytics/useToolTracking';
import {
  calculateVlsm,
  cidrToSubnetMask,
  ipToNumber,
  isValidCidr,
  isValidIp,
  VlsmResult,
  COMMON_CIDR_OPTIONS,
} from '../utils/networkCalculator';

interface VlsmCalculatorProps {
  lng: Language;
}

interface SubnetRow {
  id: string;
  name: string;
  requiredHosts: string;
}

let idCounter = 0;
const newId = () => {
  idCounter += 1;
  return `vlsm-${idCounter}`;
};

const DEFAULT_ROWS: SubnetRow[] = [
  { id: newId(), name: 'Subnet A', requiredHosts: '100' },
  { id: newId(), name: 'Subnet B', requiredHosts: '50' },
  { id: newId(), name: 'Subnet C', requiredHosts: '25' },
];

export function VlsmCalculator({ lng }: VlsmCalculatorProps) {
  const { t } = useTranslation(lng, 'network-calculator');
  const { trackInputStarted, trackUse } = useToolTracking('network-calculator', 'calculator');

  const [baseNetwork, setBaseNetwork] = useState('192.168.0.0');
  const [baseCidr, setBaseCidr] = useState('16');
  const [rows, setRows] = useState<SubnetRow[]>(DEFAULT_ROWS);
  const [result, setResult] = useState<VlsmResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddRow = () => {
    trackInputStarted();
    setRows((prev) => [...prev, { id: newId(), name: '', requiredHosts: '' }]);
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRowChange = (id: string, field: keyof Omit<SubnetRow, 'id'>, value: string) => {
    trackInputStarted();
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    setError(null);
  };

  const handleCalculate = () => {
    setError(null);
    setResult(null);

    if (!isValidIp(baseNetwork)) {
      setError(t('messages.invalidNetwork'));
      trackUse({
        action_type: 'calculate',
        success: false,
        calc_type: 'vlsm',
        error_code: 'invalid_network',
      });
      return;
    }
    const cidr = Number(baseCidr);
    if (!isValidCidr(cidr)) {
      setError(t('messages.invalidCidr'));
      trackUse({
        action_type: 'calculate',
        success: false,
        calc_type: 'vlsm',
        error_code: 'invalid_cidr',
      });
      return;
    }
    const validRows = rows.filter((r) => r.requiredHosts && Number(r.requiredHosts) > 0);
    if (validRows.length === 0) {
      setError(t('messages.minOneSubnet'));
      trackUse({
        action_type: 'calculate',
        success: false,
        calc_type: 'vlsm',
        error_code: 'min_one_subnet',
      });
      return;
    }

    const subnets = validRows.map((r) => ({
      name: r.name || `Subnet ${r.id}`,
      requiredHosts: Number(r.requiredHosts),
    }));

    try {
      // Align base network to its prefix using Math (avoids bitwise ops)
      const blockSize = 2 ** (32 - cidr);
      const ipNum = ipToNumber(baseNetwork);
      const alignedBase = ipNum - (ipNum % blockSize);
      const alignedBaseIp = [
        Math.floor(alignedBase / 16777216) % 256,
        Math.floor(alignedBase / 65536) % 256,
        Math.floor(alignedBase / 256) % 256,
        alignedBase % 256,
      ].join('.');

      const vlsmResult = calculateVlsm(alignedBaseIp, cidr, subnets);

      // Check overflow: if any subnet overflows base range
      const baseEnd = alignedBase + blockSize;
      const lastSubnet = vlsmResult.subnets[vlsmResult.subnets.length - 1];
      if (lastSubnet) {
        const lastBroadcastNum = ipToNumber(lastSubnet.broadcastAddress);
        if (lastBroadcastNum >= baseEnd) {
          setError(t('messages.subnetOverflow'));
          trackUse({
            action_type: 'calculate',
            success: false,
            calc_type: 'vlsm',
            error_code: 'overflow',
          });
          return;
        }
      }

      setResult(vlsmResult);
      trackUse({
        action_type: 'calculate',
        success: true,
        calc_type: 'vlsm',
        subnet_count: vlsmResult.subnets.length,
      });
    } catch {
      setError(t('messages.subnetOverflow'));
      trackUse({
        action_type: 'calculate',
        success: false,
        calc_type: 'vlsm',
        error_code: 'overflow',
      });
    }
  };

  const handleClear = () => {
    setBaseNetwork('');
    setBaseCidr('16');
    setRows([{ id: newId(), name: '', requiredHosts: '' }]);
    setResult(null);
    setError(null);
  };

  return (
    <div className="w-full space-y-4">
      {/* Input panel */}
      <div className={cn(SERVICE_PANEL, 'space-y-4 p-4 md:p-5')}>
        {/* Base network */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Text asChild variant="d2" color="basic-4">
              <label htmlFor="vlsm-base">{t('vlsm.baseNetwork')}</label>
            </Text>
            <Input
              id="vlsm-base"
              type="text"
              value={baseNetwork}
              onChange={(e) => {
                trackInputStarted();
                setBaseNetwork(e.target.value);
              }}
              placeholder={t('vlsm.baseNetworkPlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Text asChild variant="d2" color="basic-4">
              <label htmlFor="vlsm-cidr">{t('vlsm.baseCidr')}</label>
            </Text>
            <Select
              value={baseCidr}
              onValueChange={(value) => {
                trackInputStarted();
                setBaseCidr(value);
              }}
            >
              <SelectTrigger id="vlsm-cidr" aria-label={t('vlsm.baseCidr')}>
                <SelectValue />
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

        {/* Subnet rows */}
        <div className="space-y-2">
          <Text asChild variant="d2" color="basic-4">
            <p className="font-semibold">{t('vlsm.subnets')}</p>
          </Text>
          <div className="space-y-2">
            {rows.map((row, idx) => (
              <div key={row.id} className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-point-4 text-xs font-bold text-point-fg dark:bg-point-1/20 dark:text-point-3">
                  {idx + 1}
                </div>
                <Input
                  type="text"
                  value={row.name}
                  onChange={(e) => handleRowChange(row.id, 'name', e.target.value)}
                  placeholder={t('vlsm.subnetNamePlaceholder')}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min={1}
                  value={row.requiredHosts}
                  onChange={(e) => handleRowChange(row.id, 'requiredHosts', e.target.value)}
                  placeholder={t('vlsm.requiredHostsPlaceholder')}
                  className="w-28"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveRow(row.id)}
                  className="rounded-lg p-1.5 text-fg-6 transition-colors hover:bg-danger-4 hover:text-danger-2 dark:hover:bg-danger-1/20"
                  aria-label={t('vlsm.removeSubnet')}
                  disabled={rows.length === 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-basic-2 text-fg-3 hover:bg-basic-3"
            onClick={handleAddRow}
          >
            <Plus size={14} />
            {t('vlsm.addSubnet')}
          </Button>
        </div>

        {error && (
          <Text variant="d2" className="text-danger-2">
            {error}
          </Text>
        )}

        <div className="flex gap-2">
          <Button type="button" onClick={handleCalculate}>
            {t('vlsm.calculate')}
          </Button>
          <Button
            type="button"
            className="px-4 py-2 text-sm bg-basic-2 text-fg-1 hover:bg-basic-3"
            onClick={handleClear}
          >
            {t('vlsm.clear')}
          </Button>
        </div>
      </div>

      {/* Results panel */}
      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4 md:p-5')}>
        <H1 className="text-2xl md:text-3xl">{t('vlsm.results')}</H1>

        {!result && !error && (
          <Text variant="d2" color="basic-5">
            {t('vlsm.resultsEmpty')}
          </Text>
        )}

        {result && (
          <div className="space-y-4">
            {/* Table for desktop, cards for mobile */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[
                      t('vlsm.name'),
                      t('vlsm.required'),
                      t('vlsm.network'),
                      t('vlsm.cidr'),
                      t('vlsm.broadcast'),
                      t('vlsm.range'),
                      t('vlsm.usable'),
                    ].map((header) => (
                      <TableHead key={header}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.subnets.map((subnet) => (
                    <TableRow key={subnet.networkAddress}>
                      <TableCell className="font-medium">{subnet.name}</TableCell>
                      <TableCell>{subnet.requiredHosts.toLocaleString()}</TableCell>
                      <TableCell className="font-mono">{subnet.networkAddress}</TableCell>
                      <TableCell className="font-mono">/{subnet.cidr}</TableCell>
                      <TableCell className="font-mono">{subnet.broadcastAddress}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {subnet.firstHost} – {subnet.lastHost}
                      </TableCell>
                      <TableCell>{subnet.usableHosts.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {result.subnets.map((subnet) => (
                <div
                  key={`card-${subnet.networkAddress}`}
                  className="rounded-2xl bg-basic-0/70 p-3 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Text asChild variant="d2">
                      <p className="font-bold">{subnet.name}</p>
                    </Text>
                    <span className="rounded-full bg-point-4 px-2 py-0.5 text-xs font-semibold text-point-fg dark:bg-point-1/20 dark:text-point-3">
                      /{subnet.cidr}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div>
                      <span className="text-fg-5">{t('vlsm.network')}: </span>
                      <span className="font-mono">{subnet.networkAddress}</span>
                    </div>
                    <div>
                      <span className="text-fg-5">{t('vlsm.broadcast')}: </span>
                      <span className="font-mono">{subnet.broadcastAddress}</span>
                    </div>
                    <div>
                      <span className="text-fg-5">{t('vlsm.required')}: </span>
                      <span>{subnet.requiredHosts.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-fg-5">{t('vlsm.usable')}: </span>
                      <span>{subnet.usableHosts.toLocaleString()}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-fg-5">{t('vlsm.range')}: </span>
                      <span className="font-mono text-xs">
                        {subnet.firstHost} – {subnet.lastHost}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Remaining space */}
            {result.remainingSpace > 0 && (
              <div className="rounded-2xl border border-warn-3 bg-warn-4 p-3 dark:border-warn-1/50 dark:bg-warn-1/20">
                <Text variant="d2" className="text-warn-1 dark:text-warn-3">
                  {t('vlsm.remainingIps', { amount: result.remainingSpace.toLocaleString() })}
                </Text>
              </div>
            )}
          </div>
        )}
      </div>

      {result && <GoogleAd slotId="7911066601" className="w-full mt-4" />}
    </div>
  );
}
