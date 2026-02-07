'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Text } from '@components/basic/Text';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const DEFAULT_FOREGROUND = '#111827';
const DEFAULT_BACKGROUND = '#ffffff';

const HEX_PATTERN = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const normalizeHex = (value: string) => {
  const trimmed = value.trim();
  if (!HEX_PATTERN.test(trimmed)) {
    return null;
  }

  const hex = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
  if (hex.length === 3) {
    const [r, g, b] = hex.split('');
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return `#${hex.toLowerCase()}`;
};

const hexToRgb = (hex: string) => {
  const normalized = normalizeHex(hex);
  if (!normalized) {
    return null;
  }

  const value = normalized.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return { r, g, b };
};

const channelToLinear = (channel: number) => {
  const srgb = channel / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
};

const relativeLuminance = (hex: string) => {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return null;
  }

  const r = channelToLinear(rgb.r);
  const g = channelToLinear(rgb.g);
  const b = channelToLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastRatio = (foreground: string, background: string) => {
  const foregroundLum = relativeLuminance(foreground);
  const backgroundLum = relativeLuminance(background);

  if (foregroundLum === null || backgroundLum === null) {
    return null;
  }

  const lighter = Math.max(foregroundLum, backgroundLum);
  const darker = Math.min(foregroundLum, backgroundLum);
  return (lighter + 0.05) / (darker + 0.05);
};

type ContrastCheckerClientProps = {
  lng: Language;
};

function ContrastCheckerClient({ lng }: ContrastCheckerClientProps) {
  const { t } = useTranslation(lng, 'contrast-checker');
  const [foreground, setForeground] = useState(DEFAULT_FOREGROUND);
  const [background, setBackground] = useState(DEFAULT_BACKGROUND);
  const [copied, setCopied] = useState(false);

  const normalizedForeground = useMemo(() => normalizeHex(foreground), [foreground]);
  const normalizedBackground = useMemo(() => normalizeHex(background), [background]);
  const ratio = useMemo(() => {
    if (!normalizedForeground || !normalizedBackground) {
      return null;
    }
    return contrastRatio(normalizedForeground, normalizedBackground);
  }, [normalizedForeground, normalizedBackground]);

  const ratioText = ratio ? ratio.toFixed(2) : '--';

  const handleSwap = () => {
    setForeground(background);
    setBackground(foreground);
  };

  const handleReset = () => {
    setForeground(DEFAULT_FOREGROUND);
    setBackground(DEFAULT_BACKGROUND);
  };

  const handleCopy = async () => {
    if (!ratio) {
      return;
    }
    await navigator.clipboard.writeText(ratio.toFixed(2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const examples = [
    {
      label: t('examples.darkOnLight'),
      foreground: '#111827',
      background: '#f9fafb',
    },
    {
      label: t('examples.lightOnDark'),
      foreground: '#ffffff',
      background: '#1f2937',
    },
    {
      label: t('examples.brandPair'),
      foreground: '#0f172a',
      background: '#38bdf8',
    },
  ];

  const normalAA = ratio ? ratio >= 4.5 : null;
  const normalAAA = ratio ? ratio >= 7 : null;
  const largeAA = ratio ? ratio >= 3 : null;
  const largeAAA = ratio ? ratio >= 4.5 : null;

  return (
    <div className={cn(SERVICE_PANEL_SOFT, 'space-y-6 p-4')}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Text asChild variant="c1" color="basic-5" className="block font-medium">
            <label htmlFor="contrast-foreground">{t('label.foreground')}</label>
          </Text>
          <div className="flex items-center gap-2">
            <input
              id="contrast-foreground"
              type="color"
              value={normalizedForeground ?? DEFAULT_FOREGROUND}
              onChange={(event) => setForeground(event.target.value)}
              className="h-10 w-10 cursor-pointer rounded border border-gray-200 dark:border-gray-700"
            />
            <Input
              value={foreground}
              onChange={(event) => setForeground(event.target.value)}
              placeholder="#111827"
              aria-label={t('label.foreground')}
            />
          </div>
          {!normalizedForeground ? (
            <Text variant="c2" color="basic-5">
              {t('error.invalidHex')}
            </Text>
          ) : null}
        </div>

        <div className="space-y-2">
          <Text asChild variant="c1" color="basic-5" className="block font-medium">
            <label htmlFor="contrast-background">{t('label.background')}</label>
          </Text>
          <div className="flex items-center gap-2">
            <input
              id="contrast-background"
              type="color"
              value={normalizedBackground ?? DEFAULT_BACKGROUND}
              onChange={(event) => setBackground(event.target.value)}
              className="h-10 w-10 cursor-pointer rounded border border-gray-200 dark:border-gray-700"
            />
            <Input
              value={background}
              onChange={(event) => setBackground(event.target.value)}
              placeholder="#ffffff"
              aria-label={t('label.background')}
            />
          </div>
          {!normalizedBackground ? (
            <Text variant="c2" color="basic-5">
              {t('error.invalidHex')}
            </Text>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleSwap}>
          {t('action.swap')}
        </Button>
        <Button type="button" onClick={handleReset}>
          {t('action.reset')}
        </Button>
        <Button type="button" onClick={handleCopy} disabled={!ratio}>
          {copied ? t('action.copied') : t('action.copyRatio')}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example.label}
            type="button"
            className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 transition hover:border-point-1 hover:text-point-1 dark:border-gray-700 dark:text-gray-200"
            onClick={() => {
              setForeground(example.foreground);
              setBackground(example.background);
            }}
          >
            {example.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Text variant="d1" color="basic-1" className="font-semibold">
            {t('label.ratio')}
          </Text>
          <div className="flex items-center gap-3">
            <Text variant="t3" color="basic-1" className="font-bold">
              {ratioText}
            </Text>
            <Text variant="d3" color="basic-4">
              {t('label.ratioUnit')}
            </Text>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <Text variant="d3" color="basic-4">
                {t('label.normalText')}
              </Text>
              <div className="flex items-center gap-2">
                <span className={normalAA ? 'text-green-600' : 'text-red-600'}>
                  {t(normalAA ? 'status.passAA' : 'status.failAA')}
                </span>
                <span className={normalAAA ? 'text-green-600' : 'text-red-600'}>
                  {t(normalAAA ? 'status.passAAA' : 'status.failAAA')}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <Text variant="d3" color="basic-4">
                {t('label.largeText')}
              </Text>
              <div className="flex items-center gap-2">
                <span className={largeAA ? 'text-green-600' : 'text-red-600'}>
                  {t(largeAA ? 'status.passAA' : 'status.failAA')}
                </span>
                <span className={largeAAA ? 'text-green-600' : 'text-red-600'}>
                  {t(largeAAA ? 'status.passAAA' : 'status.failAAA')}
                </span>
              </div>
            </div>
          </div>
          <Text variant="c1" color="basic-5">
            {t('helper.note')}
          </Text>
        </div>

        <div
          className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-gray-200 p-6 text-center dark:border-gray-700"
          style={{
            backgroundColor: normalizedBackground ?? DEFAULT_BACKGROUND,
            color: normalizedForeground ?? DEFAULT_FOREGROUND,
          }}
        >
          <Text variant="t2" className="font-bold">
            {t('preview.title')}
          </Text>
          <Text variant="d2" className="mt-2">
            {t('preview.subtitle')}
          </Text>
          <Text variant="c1" className="mt-4">
            {t('preview.body')}
          </Text>
        </div>
      </div>
    </div>
  );
}

export default ContrastCheckerClient;
