'use client';

import React from 'react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { Text } from '@components/basic/Text';

const DEFAULT_STRIDE = 70;
const DEFAULT_WEIGHT = 60;
const CALORIE_PER_KM_PER_KG = 1.036;

type I18n = {
  title: string;
  description: string;
  modeLabel: string;
  modes: {
    distance: string;
    steps: string;
  };
  inputs: {
    distance: string;
    steps: string;
    stride: string;
    weight: string;
  };
  placeholders: {
    distance: string;
    steps: string;
    stride: string;
    weight: string;
  };
  helper: {
    stride: string;
    weight: string;
  };
  actions: {
    reset: string;
    copy: string;
    copied: string;
  };
  results: {
    distance: string;
    calorie: string;
    formula: string;
    empty: string;
  };
  notes: {
    defaultStride: string;
    defaultWeight: string;
  };
};

const formatNumber = (value: number, digits = 2) => {
  if (!Number.isFinite(value)) return '--';
  return value.toFixed(digits);
};

export default function WalkingCalorieCalculator({ i18n }: { i18n: I18n }) {
  const [mode, setMode] = React.useState<'distance' | 'steps'>('distance');
  const [distance, setDistance] = React.useState('');
  const [steps, setSteps] = React.useState('');
  const [stride, setStride] = React.useState(String(DEFAULT_STRIDE));
  const [weight, setWeight] = React.useState(String(DEFAULT_WEIGHT));
  const [copied, setCopied] = React.useState(false);

  const distanceKm = React.useMemo(() => {
    if (mode === 'distance') {
      const value = Number(distance);
      return Number.isFinite(value) ? value : 0;
    }
    const stepsValue = Number(steps);
    const strideValue = Number(stride) || DEFAULT_STRIDE;
    if (!Number.isFinite(stepsValue) || stepsValue <= 0) return 0;
    return (stepsValue * strideValue) / 100000;
  }, [distance, steps, stride, mode]);

  const weightKg = React.useMemo(() => {
    const value = Number(weight);
    return Number.isFinite(value) && value > 0 ? value : DEFAULT_WEIGHT;
  }, [weight]);

  const calories = React.useMemo(() => {
    if (distanceKm <= 0) return 0;
    return distanceKm * weightKg * CALORIE_PER_KM_PER_KG;
  }, [distanceKm, weightKg]);

  const handleReset = () => {
    setMode('distance');
    setDistance('');
    setSteps('');
    setStride(String(DEFAULT_STRIDE));
    setWeight(String(DEFAULT_WEIGHT));
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!distanceKm) return;
    const summary = [
      `${i18n.results.distance}: ${formatNumber(distanceKm)} km`,
      `${i18n.results.calorie}: ${formatNumber(calories)} kcal`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const hasResult = distanceKm > 0;

  return (
    <section className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="space-y-2">
        <Text variant="d2" className="font-semibold">
          {i18n.modeLabel}
        </Text>
        <Select value={mode} onValueChange={(value) => setMode(value as 'distance' | 'steps')}>
          <SelectTrigger aria-label={i18n.modeLabel}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distance">{i18n.modes.distance}</SelectItem>
            <SelectItem value="steps">{i18n.modes.steps}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {mode === 'distance' ? (
          <div className="space-y-2">
            <Text variant="d2" className="font-semibold">
              {i18n.inputs.distance}
            </Text>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              placeholder={i18n.placeholders.distance}
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
            />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Text variant="d2" className="font-semibold">
                {i18n.inputs.steps}
              </Text>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder={i18n.placeholders.steps}
                value={steps}
                onChange={(event) => setSteps(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Text variant="d2" className="font-semibold">
                {i18n.inputs.stride}
              </Text>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                placeholder={i18n.placeholders.stride}
                value={stride}
                onChange={(event) => setStride(event.target.value)}
              />
              <Text variant="c1" color="basic-5">
                {i18n.helper.stride}
              </Text>
            </div>
          </>
        )}
        <div className="space-y-2">
          <Text variant="d2" className="font-semibold">
            {i18n.inputs.weight}
          </Text>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            placeholder={i18n.placeholders.weight}
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
          />
          <Text variant="c1" color="basic-5">
            {i18n.helper.weight}
          </Text>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800">
        {hasResult ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Text variant="d2" className="font-semibold">
                {i18n.results.distance}
              </Text>
              <Text variant="t3" className="font-semibold">
                {formatNumber(distanceKm)} km
              </Text>
            </div>
            <div className="flex items-center justify-between">
              <Text variant="d2" className="font-semibold">
                {i18n.results.calorie}
              </Text>
              <Text variant="t3" className="font-semibold">
                {formatNumber(calories)} kcal
              </Text>
            </div>
            <Text variant="c1" color="basic-5">
              {i18n.results.formula}
            </Text>
          </div>
        ) : (
          <Text variant="d2" color="basic-4">
            {i18n.results.empty}
          </Text>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleReset} className="min-w-[120px]">
          {i18n.actions.reset}
        </Button>
        <Button
          type="button"
          onClick={handleCopy}
          className="min-w-[120px] bg-gray-900 hover:bg-gray-800"
          disabled={!hasResult}
        >
          {copied ? i18n.actions.copied : i18n.actions.copy}
        </Button>
      </div>

      <div className="space-y-1">
        <Text variant="c1" color="basic-5">
          {i18n.notes.defaultStride}
        </Text>
        <Text variant="c1" color="basic-5">
          {i18n.notes.defaultWeight}
        </Text>
      </div>
    </section>
  );
}
