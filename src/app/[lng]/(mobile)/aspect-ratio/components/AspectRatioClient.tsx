'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, RefreshCcw } from 'lucide-react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { H1 } from '@components/basic/Text/Headers';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface AspectRatioClientProps {
  lng: Language;
}

const formatValue = (value: number) => {
  if (!Number.isFinite(value)) return '';
  if (Number.isInteger(value)) return value.toString();
  return value
    .toFixed(2)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*[1-9])0+$/, '$1');
};

const parseValue = (value: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
};

const gcd = (a: number, b: number): number => {
  if (!b) return a;
  return gcd(b, a % b);
};

export default function AspectRatioClient({ lng }: AspectRatioClientProps) {
  const { t } = useTranslation(lng, 'aspect-ratio');
  const [originalWidth, setOriginalWidth] = useState('1920');
  const [originalHeight, setOriginalHeight] = useState('1080');
  const [targetWidth, setTargetWidth] = useState('');
  const [targetHeight, setTargetHeight] = useState('');
  const [lockRatio, setLockRatio] = useState(true);
  const [copied, setCopied] = useState(false);
  const [lastEdited, setLastEdited] = useState<'width' | 'height' | null>(null);

  const ratio = useMemo(() => {
    const width = parseValue(originalWidth);
    const height = parseValue(originalHeight);
    if (!width || !height) return null;
    return width / height;
  }, [originalWidth, originalHeight]);

  const ratioLabel = useMemo(() => {
    const width = parseValue(originalWidth);
    const height = parseValue(originalHeight);
    if (!width || !height) return '-';
    const widthInt = Math.round(width);
    const heightInt = Math.round(height);
    if (Math.abs(width - widthInt) < 0.001 && Math.abs(height - heightInt) < 0.001) {
      const divisor = gcd(widthInt, heightInt);
      return `${widthInt / divisor}:${heightInt / divisor}`;
    }
    return `${formatValue(width)}:${formatValue(height)}`;
  }, [originalWidth, originalHeight]);

  const result = useMemo(() => {
    if (!ratio) return null;
    const widthValue = parseValue(targetWidth);
    const heightValue = parseValue(targetHeight);

    if (lastEdited === 'width' && widthValue) {
      return {
        width: widthValue,
        height: widthValue / ratio,
      };
    }

    if (lastEdited === 'height' && heightValue) {
      return {
        width: heightValue * ratio,
        height: heightValue,
      };
    }

    if (widthValue) {
      return {
        width: widthValue,
        height: widthValue / ratio,
      };
    }

    if (heightValue) {
      return {
        width: heightValue * ratio,
        height: heightValue,
      };
    }

    return null;
  }, [ratio, targetWidth, targetHeight, lastEdited]);

  useEffect(() => {
    if (!lockRatio || !ratio || !lastEdited) return;
    if (lastEdited === 'width') {
      const widthValue = parseValue(targetWidth);
      if (!widthValue) return;
      const nextHeight = widthValue / ratio;
      setTargetHeight(formatValue(nextHeight));
    }
    if (lastEdited === 'height') {
      const heightValue = parseValue(targetHeight);
      if (!heightValue) return;
      const nextWidth = heightValue * ratio;
      setTargetWidth(formatValue(nextWidth));
    }
  }, [lockRatio, ratio, targetWidth, targetHeight, lastEdited]);

  useEffect(() => {
    setCopied(false);
  }, [result?.width, result?.height]);

  const handleCopy = async () => {
    if (!result) return;
    const text = `${formatValue(result.width)} x ${formatValue(result.height)}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy aspect ratio result:', error);
    }
  };

  const handleReset = () => {
    setOriginalWidth('1920');
    setOriginalHeight('1080');
    setTargetWidth('');
    setTargetHeight('');
    setLastEdited(null);
    setCopied(false);
    setLockRatio(true);
  };

  const handleSample = () => {
    setOriginalWidth('1080');
    setOriginalHeight('1350');
    setTargetWidth('600');
    setLastEdited('width');
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <Text variant="d2" className="font-semibold text-gray-800 dark:text-gray-200">
          {t('section.original')}
        </Text>
        <div className="grid gap-3 md:grid-cols-2">
          <label
            htmlFor="aspect-original-width"
            className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.originalWidth')}
            <Input
              id="aspect-original-width"
              type="number"
              inputMode="decimal"
              placeholder={t('placeholder.width')}
              value={originalWidth}
              onChange={(event) => setOriginalWidth(event.target.value)}
            />
          </label>
          <label
            htmlFor="aspect-original-height"
            className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.originalHeight')}
            <Input
              id="aspect-original-height"
              type="number"
              inputMode="decimal"
              placeholder={t('placeholder.height')}
              value={originalHeight}
              onChange={(event) => setOriginalHeight(event.target.value)}
            />
          </label>
        </div>
        <Text variant="c1" color="basic-5">
          {t('helper.original')}
        </Text>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Text variant="d2" className="font-semibold text-gray-800 dark:text-gray-200">
            {t('section.target')}
          </Text>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
            <input
              id="aspect-lock-ratio"
              type="checkbox"
              checked={lockRatio}
              onChange={() => setLockRatio(!lockRatio)}
              className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
            />
            <label htmlFor="aspect-lock-ratio">{t('label.lockRatio')}</label>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label
            htmlFor="aspect-target-width"
            className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.targetWidth')}
            <Input
              id="aspect-target-width"
              type="number"
              inputMode="decimal"
              placeholder={t('placeholder.width')}
              value={targetWidth}
              onChange={(event) => {
                setTargetWidth(event.target.value);
                setLastEdited('width');
              }}
            />
          </label>
          <label
            htmlFor="aspect-target-height"
            className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.targetHeight')}
            <Input
              id="aspect-target-height"
              type="number"
              inputMode="decimal"
              placeholder={t('placeholder.height')}
              value={targetHeight}
              onChange={(event) => {
                setTargetHeight(event.target.value);
                setLastEdited('height');
              }}
            />
          </label>
        </div>
        <Text variant="c1" color="basic-5">
          {t('helper.target')}
        </Text>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleSample} className="px-3 py-2 text-xs">
            {t('button.sample')}
          </Button>
          <Button type="button" onClick={handleReset} className="px-3 py-2 text-xs">
            <RefreshCcw size={14} className="mr-1" />
            {t('button.reset')}
          </Button>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <H1 className="text-gray-900 dark:text-gray-100">{t('section.result')}</H1>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!result}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2 rounded-2xl border border-dashed border-gray-200 p-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">
            <Text variant="d2" className="font-semibold">
              {t('label.ratio')}
            </Text>
            <Text variant="d1" className="font-semibold text-point-1">
              {ratioLabel}
            </Text>
          </div>
          <div className="space-y-2 rounded-2xl border border-dashed border-gray-200 p-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">
            <Text variant="d2" className="font-semibold">
              {t('label.result')}
            </Text>
            <Text variant="d1" className="font-semibold text-point-1">
              {result ? `${formatValue(result.width)} x ${formatValue(result.height)}` : t('empty')}
            </Text>
          </div>
        </div>
        <Text variant="c1" color="basic-5">
          {t('helper.result')}
        </Text>
      </div>
    </div>
  );
}
