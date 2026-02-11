'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@components/basic/Input';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface ColorConverterClientProps {
  lng: Language;
}

const normalizeHex = (value: string) => {
  const trimmed = value.trim().replace(/^#/, '').toLowerCase();
  if (trimmed.length === 3) {
    return trimmed
      .split('')
      .map((char) => `${char}${char}`)
      .join('');
  }
  return trimmed;
};

const isValidHex = (value: string) => /^[0-9a-f]{6}$/.test(value);

const rgbToHsl = (r: number, g: number, b: number) => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;
  const lightness = (max + min) / 2;

  let hue = 0;
  let saturation = 0;

  if (delta !== 0) {
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    if (max === rNorm) {
      hue = (gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0);
    } else if (max === gNorm) {
      hue = (bNorm - rNorm) / delta + 2;
    } else {
      hue = (rNorm - gNorm) / delta + 4;
    }

    hue /= 6;
  }

  return {
    h: Math.round(hue * 360),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
};

export default function ColorConverterClient({ lng }: ColorConverterClientProps) {
  const { t } = useTranslation(lng, 'color-converter');
  const [value, setValue] = useState('');

  const normalized = useMemo(() => normalizeHex(value), [value]);
  const isValid = useMemo(() => isValidHex(normalized), [normalized]);

  const colorHex = isValid ? `#${normalized}` : '';

  const rgb = useMemo(() => {
    if (!isValid) return '';
    const red = parseInt(normalized.slice(0, 2), 16);
    const green = parseInt(normalized.slice(2, 4), 16);
    const blue = parseInt(normalized.slice(4, 6), 16);
    return `rgb(${red}, ${green}, ${blue})`;
  }, [isValid, normalized]);

  const hsl = useMemo(() => {
    if (!isValid) return '';
    const red = parseInt(normalized.slice(0, 2), 16);
    const green = parseInt(normalized.slice(2, 4), 16);
    const blue = parseInt(normalized.slice(4, 6), 16);
    const { h, s, l } = rgbToHsl(red, green, blue);
    return `hsl(${h}°, ${s}%, ${l}%)`;
  }, [isValid, normalized]);

  const showInvalid = normalized.length > 0 && !isValid;

  const results = [
    {
      label: t('label.normalized'),
      value: isValid ? colorHex.toUpperCase() : '-',
    },
    {
      label: t('label.rgb'),
      value: isValid ? rgb : '-',
    },
    {
      label: t('label.hsl'),
      value: isValid ? hsl : '-',
    },
  ];

  return (
    <div className="space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="color-converter-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.input')}
        </label>
        <Input
          id="color-converter-input"
          className="font-mono"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t('placeholder')}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('label.preview')}
          </p>
          {showInvalid && <span className="text-xs font-medium text-rose-500">{t('invalid')}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div
            className={cn(
              'h-16 w-16 rounded-2xl border shadow-sm',
              isValid
                ? 'border-zinc-200/80 dark:border-zinc-700/80'
                : 'border-dashed border-zinc-300/80 dark:border-zinc-600/70',
            )}
            style={isValid ? { backgroundColor: colorHex } : undefined}
          />
          <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3">
            {results.map((result) => (
              <div
                key={result.label}
                className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'p-3')}
              >
                <p className="text-xs text-gray-500 dark:text-gray-400">{result.label}</p>
                <p className="font-mono text-sm text-gray-800 dark:text-gray-100">{result.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
