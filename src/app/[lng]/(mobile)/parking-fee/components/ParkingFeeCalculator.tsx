'use client';

import React, { useMemo, useState } from 'react';
import { H1, Text } from '@components/basic/Text';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Language } from '~/app/i18n/settings';

const toNumber = (value: string) => (value.trim() === '' ? Number.NaN : Number(value));

type ParkingFeeTexts = {
  title: string;
  description: string;
  form: {
    entryTime: string;
    exitTime: string;
    baseMinutes: string;
    baseFee: string;
    unitMinutes: string;
    unitFee: string;
    dailyMax: string;
  };
  helper: {
    overnight: string;
    feeRule: string;
  };
  button: {
    copy: string;
    clear: string;
    setNow: string;
  };
  result: {
    title: string;
    duration: string;
    fee: string;
    unit: {
      minutes: string;
      won: string;
    };
    copied: string;
  };
  validation: {
    missingTime: string;
    invalidNumber: string;
    unitMinutes: string;
  };
  examples: {
    title: string;
    items: string[];
  };
};

type ParkingFeeCalculatorProps = {
  lng: Language;
  texts: ParkingFeeTexts;
};

const DEFAULT_BASE_MINUTES = '30';
const DEFAULT_BASE_FEE = '1000';
const DEFAULT_UNIT_MINUTES = '10';
const DEFAULT_UNIT_FEE = '500';

const formatTime = (date: Date) => date.toTimeString().slice(0, 5);

const parseTimeToMinutes = (value: string) => {
  const [hours, minutes] = value.split(':').map((part) => Number(part));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return Number.NaN;
  }
  return hours * 60 + minutes;
};

export default function ParkingFeeCalculator({ lng, texts }: ParkingFeeCalculatorProps) {
  const [entryTime, setEntryTime] = useState('');
  const [exitTime, setExitTime] = useState('');
  const [baseMinutes, setBaseMinutes] = useState(DEFAULT_BASE_MINUTES);
  const [baseFee, setBaseFee] = useState(DEFAULT_BASE_FEE);
  const [unitMinutes, setUnitMinutes] = useState(DEFAULT_UNIT_MINUTES);
  const [unitFee, setUnitFee] = useState(DEFAULT_UNIT_FEE);
  const [dailyMax, setDailyMax] = useState('');
  const [copied, setCopied] = useState(false);

  const formatter = useMemo(() => new Intl.NumberFormat(lng), [lng]);

  const durationMinutes = useMemo(() => {
    if (!entryTime || !exitTime) {
      return null;
    }
    const entry = parseTimeToMinutes(entryTime);
    const exit = parseTimeToMinutes(exitTime);
    if (Number.isNaN(entry) || Number.isNaN(exit)) {
      return null;
    }
    const diff = exit - entry;
    return diff >= 0 ? diff : diff + 24 * 60;
  }, [entryTime, exitTime]);

  const validationMessage = useMemo(() => {
    if (!entryTime || !exitTime) {
      return texts.validation.missingTime;
    }
    const baseMinutesValue = toNumber(baseMinutes);
    const baseFeeValue = toNumber(baseFee);
    const unitMinutesValue = toNumber(unitMinutes);
    const unitFeeValue = toNumber(unitFee);
    const dailyMaxValue = dailyMax ? toNumber(dailyMax) : 0;

    const invalidNumbers =
      Number.isNaN(baseMinutesValue) ||
      Number.isNaN(baseFeeValue) ||
      Number.isNaN(unitMinutesValue) ||
      Number.isNaN(unitFeeValue) ||
      (dailyMax && Number.isNaN(dailyMaxValue));

    if (invalidNumbers || baseMinutesValue < 0 || baseFeeValue < 0 || unitFeeValue < 0) {
      return texts.validation.invalidNumber;
    }

    if (unitMinutesValue <= 0) {
      return texts.validation.unitMinutes;
    }

    if (dailyMax && dailyMaxValue < 0) {
      return texts.validation.invalidNumber;
    }

    return '';
  }, [
    baseFee,
    baseMinutes,
    dailyMax,
    entryTime,
    exitTime,
    texts.validation.invalidNumber,
    texts.validation.missingTime,
    texts.validation.unitMinutes,
    unitFee,
    unitMinutes,
  ]);

  const estimatedFee = useMemo(() => {
    if (!durationMinutes || validationMessage) {
      return null;
    }
    const baseMinutesValue = toNumber(baseMinutes);
    const baseFeeValue = toNumber(baseFee);
    const unitMinutesValue = toNumber(unitMinutes);
    const unitFeeValue = toNumber(unitFee);
    const dailyMaxValue = dailyMax ? toNumber(dailyMax) : 0;

    if (
      Number.isNaN(baseMinutesValue) ||
      Number.isNaN(baseFeeValue) ||
      Number.isNaN(unitMinutesValue) ||
      Number.isNaN(unitFeeValue) ||
      (dailyMax && Number.isNaN(dailyMaxValue))
    ) {
      return null;
    }

    let totalFee = baseFeeValue;
    if (durationMinutes > baseMinutesValue) {
      const extraMinutes = durationMinutes - baseMinutesValue;
      const extraUnits = Math.ceil(extraMinutes / unitMinutesValue);
      totalFee += extraUnits * unitFeeValue;
    }

    if (dailyMax && dailyMaxValue > 0) {
      totalFee = Math.min(totalFee, dailyMaxValue);
    }

    return totalFee;
  }, [baseFee, baseMinutes, dailyMax, durationMinutes, unitFee, unitMinutes, validationMessage]);

  const handleClear = () => {
    setEntryTime('');
    setExitTime('');
    setBaseMinutes(DEFAULT_BASE_MINUTES);
    setBaseFee(DEFAULT_BASE_FEE);
    setUnitMinutes(DEFAULT_UNIT_MINUTES);
    setUnitFee(DEFAULT_UNIT_FEE);
    setDailyMax('');
    setCopied(false);
  };

  const handleCopy = async () => {
    if (estimatedFee === null) {
      return;
    }
    await navigator.clipboard.writeText(String(estimatedFee));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <H1>{texts.title}</H1>
        <Text variant="d2" color="basic-4">
          {texts.description}
        </Text>
      </header>

      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="space-y-2">
          <Text variant="d2">{texts.form.entryTime}</Text>
          <div className="flex gap-2">
            <Input
              type="time"
              value={entryTime}
              onChange={(event) => setEntryTime(event.target.value)}
            />
            <Button
              type="button"
              className="px-3 text-sm"
              onClick={() => setEntryTime(formatTime(new Date()))}
            >
              {texts.button.setNow}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Text variant="d2">{texts.form.exitTime}</Text>
          <div className="flex gap-2">
            <Input
              type="time"
              value={exitTime}
              onChange={(event) => setExitTime(event.target.value)}
            />
            <Button
              type="button"
              className="px-3 text-sm"
              onClick={() => setExitTime(formatTime(new Date()))}
            >
              {texts.button.setNow}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Text variant="d2">{texts.form.baseMinutes}</Text>
            <Input
              type="number"
              min={0}
              value={baseMinutes}
              onChange={(event) => setBaseMinutes(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text variant="d2">{texts.form.baseFee}</Text>
            <Input
              type="number"
              min={0}
              value={baseFee}
              onChange={(event) => setBaseFee(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text variant="d2">{texts.form.unitMinutes}</Text>
            <Input
              type="number"
              min={1}
              value={unitMinutes}
              onChange={(event) => setUnitMinutes(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text variant="d2">{texts.form.unitFee}</Text>
            <Input
              type="number"
              min={0}
              value={unitFee}
              onChange={(event) => setUnitFee(event.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Text variant="d2">{texts.form.dailyMax}</Text>
            <Input
              type="number"
              min={0}
              value={dailyMax}
              onChange={(event) => setDailyMax(event.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Text variant="c1" color="basic-5">
            {texts.helper.overnight}
          </Text>
          <Text variant="c1" color="basic-5">
            {texts.helper.feeRule}
          </Text>
        </div>

        {validationMessage && (
          <Text variant="d3" className="text-red-500">
            {validationMessage}
          </Text>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="button" className="px-4 text-sm" onClick={handleClear}>
            {texts.button.clear}
          </Button>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <Text variant="d2">{texts.result.title}</Text>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Text color="basic-5">{texts.result.duration}</Text>
            <Text>
              {durationMinutes === null
                ? '-'
                : `${formatter.format(durationMinutes)} ${texts.result.unit.minutes}`}
            </Text>
          </div>
          <div className="flex items-center justify-between">
            <Text color="basic-5">{texts.result.fee}</Text>
            <Text>
              {estimatedFee === null
                ? '-'
                : `${formatter.format(estimatedFee)} ${texts.result.unit.won}`}
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            className="px-4 text-sm"
            onClick={handleCopy}
            disabled={estimatedFee === null}
          >
            {texts.button.copy}
          </Button>
          {copied && (
            <Text variant="c1" color="basic-5">
              {texts.result.copied}
            </Text>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <Text variant="d2">{texts.examples.title}</Text>
        <ul className="list-disc space-y-1 pl-5">
          {texts.examples.items.map((item) => (
            <li key={item}>
              <Text variant="d3" color="basic-4">
                {item}
              </Text>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
