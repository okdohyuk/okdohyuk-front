'use client';

import React, { useId, useMemo, useState } from 'react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { Text } from '@components/basic/Text';
import { calculateDateRange, formatDateInput } from '../utils/dateDiff';

type Labels = {
  helper: string;
  startLabel: string;
  endLabel: string;
  includeEnd: string;
  today: string;
  swap: string;
  reset: string;
  copy: string;
  copied: string;
  resultTitle: string;
  totalDays: string;
  weeks: string;
  weekdays: string;
  weekends: string;
  empty: string;
  invalidRange: string;
  dayUnit: string;
  weekUnit: string;
  summaryTitle: string;
};

type DateDiffClientProps = {
  labels: Labels;
};

function DateDiffClient({ labels }: DateDiffClientProps) {
  const today = useMemo(() => formatDateInput(new Date()), []);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [includeEnd, setIncludeEnd] = useState(false);
  const [copied, setCopied] = useState(false);
  const startId = useId();
  const endId = useId();
  const includeEndId = useId();

  const result = useMemo(
    () => calculateDateRange(startDate, endDate, includeEnd),
    [startDate, endDate, includeEnd],
  );

  const isInvalidRange = useMemo(() => {
    if (!startDate || !endDate) return false;
    return calculateDateRange(startDate, endDate, includeEnd) === null;
  }, [startDate, endDate, includeEnd]);

  const summary = useMemo(() => {
    if (!result) return '';
    return `${labels.summaryTitle}: ${result.totalDays} ${labels.dayUnit} · ${result.weeks} ${labels.weekUnit} ${result.remainingDays} ${labels.dayUnit} · ${labels.weekdays} ${result.weekdays} / ${labels.weekends} ${result.weekends}`;
  }, [labels, result]);

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleSwap = () => {
    setStartDate(endDate);
    setEndDate(startDate);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setIncludeEnd(false);
  };

  return (
    <div className="space-y-4">
      <Text className="text-sm text-gray-600 dark:text-gray-300">{labels.helper}</Text>
      <div className="space-y-3 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="space-y-1" htmlFor={startId}>
            <Text className="text-sm text-gray-700 dark:text-gray-200">{labels.startLabel}</Text>
            <Input
              id={startId}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>
          <label className="space-y-1" htmlFor={endId}>
            <Text className="text-sm text-gray-700 dark:text-gray-200">{labels.endLabel}</Text>
            <Input
              id={endId}
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </label>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          <input
            id={includeEndId}
            type="checkbox"
            checked={includeEnd}
            onChange={(event) => setIncludeEnd(event.target.checked)}
          />
          <label htmlFor={includeEndId}>{labels.includeEnd}</label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="px-3 text-sm"
            onClick={() => {
              setStartDate(today);
              setEndDate(today);
            }}
          >
            {labels.today}
          </Button>
          <Button
            type="button"
            className="px-3 text-sm"
            onClick={handleSwap}
            disabled={!startDate || !endDate}
          >
            {labels.swap}
          </Button>
          <Button type="button" className="px-3 text-sm" onClick={handleReset}>
            {labels.reset}
          </Button>
          <Button type="button" className="px-3 text-sm" onClick={handleCopy} disabled={!summary}>
            {labels.copy}
          </Button>
          {copied ? <Text className="text-xs text-point-1">{labels.copied}</Text> : null}
        </div>
      </div>
      <div className="space-y-3 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <Text className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {labels.resultTitle}
        </Text>
        {!startDate || !endDate ? (
          <Text className="text-sm text-gray-500 dark:text-gray-400">{labels.empty}</Text>
        ) : null}
        {startDate && endDate && isInvalidRange ? (
          <Text className="text-sm text-red-500">{labels.invalidRange}</Text>
        ) : null}
        {result ? (
          <div className="grid grid-cols-1 gap-2 text-sm text-gray-700 dark:text-gray-200">
            <Text>
              {labels.totalDays}: {result.totalDays} {labels.dayUnit}
            </Text>
            <Text>
              {labels.weeks}: {result.weeks} {labels.weekUnit} {result.remainingDays}{' '}
              {labels.dayUnit}
            </Text>
            <Text>
              {labels.weekdays}: {result.weekdays}
            </Text>
            <Text>
              {labels.weekends}: {result.weekends}
            </Text>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default DateDiffClient;
