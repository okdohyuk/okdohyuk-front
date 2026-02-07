'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck } from 'lucide-react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { Textarea } from '@components/basic/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

const BASE_PARAGRAPHS = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec ullamcorper nulla non metus auctor fringilla.',
  'Curabitur blandit tempus porttitor. Maecenas faucibus mollis interdum. Praesent commodo cursus magna.',
  'Aenean lacinia bibendum nulla sed consectetur. Vestibulum id ligula porta felis euismod semper.',
  'Nullam id dolor id nibh ultricies vehicula ut id elit. Cras mattis consectetur purus sit amet fermentum.',
];

const WORD_POOL = BASE_PARAGRAPHS.join(' ').replace(/\s+/g, ' ').trim().split(' ');

type UnitType = 'paragraphs' | 'words';

const UNIT_LIMITS: Record<UnitType, number> = {
  paragraphs: 10,
  words: 200,
};

interface LoremIpsumClientProps {
  lng: Language;
}

export default function LoremIpsumClient({ lng }: LoremIpsumClientProps) {
  const { t } = useTranslation(lng, 'lorem-ipsum');
  const [unit, setUnit] = useState<UnitType>('paragraphs');
  const [count, setCount] = useState(3);
  const [copied, setCopied] = useState(false);

  const limit = UNIT_LIMITS[unit];

  const output = useMemo(() => {
    if (!count || count <= 0) return '';
    if (unit === 'paragraphs') {
      const paragraphs = Array.from({ length: count }, (_, index) => {
        return BASE_PARAGRAPHS[index % BASE_PARAGRAPHS.length];
      });
      return paragraphs.join('\n\n');
    }

    const words: string[] = [];
    for (let i = 0; i < count; i += 1) {
      words.push(WORD_POOL[i % WORD_POOL.length]);
    }
    return words.join(' ');
  }, [count, unit]);

  useEffect(() => {
    setCopied(false);
  }, [output]);

  const handleCountChange = (value: string) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;
    const normalized = Math.max(1, Math.min(limit, Math.floor(numeric)));
    setCount(normalized);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy lorem ipsum output:', error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('label.unit')}
            </p>
            <Select value={unit} onValueChange={(value) => setUnit(value as UnitType)}>
              <SelectTrigger aria-label={t('label.unit')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paragraphs">{t('unit.paragraphs')}</SelectItem>
                <SelectItem value="words">{t('unit.words')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="lorem-count"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.count')}
            </label>
            <Input
              id="lorem-count"
              type="number"
              min={1}
              max={limit}
              value={count}
              onChange={(event) => handleCountChange(event.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t(`helper.${unit}`, { max: limit })}
        </p>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('label.output')}
          </p>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!output}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
        <Textarea
          readOnly
          rows={unit === 'paragraphs' ? 10 : 6}
          className="text-sm leading-relaxed"
          value={output}
          placeholder={t('placeholder')}
        />
      </div>
    </div>
  );
}
