'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { Text } from '@components/basic/Text';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import { Copy, RefreshCw, Trash2 } from 'lucide-react';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { wordLists } from '~/app/[lng]/(mobile)/nickname-generator/utils/wordLists';

const COUNT_MIN = 1;
const COUNT_MAX = 20;

type StyleOption = 'classic' | 'double' | 'minimal';

type SeparatorOption = 'space' | 'dash' | 'underscore';

type NicknameItem = {
  id: string;
  value: string;
};

interface NicknameGeneratorClientProps {
  lng: Language;
}

const clampCount = (value: number) => Math.min(Math.max(value, COUNT_MIN), COUNT_MAX);

const randomItem = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export default function NicknameGeneratorClient({ lng }: NicknameGeneratorClientProps) {
  const { t } = useTranslation(lng, 'nickname-generator');
  const [count, setCount] = useState(5);
  const [style, setStyle] = useState<StyleOption>('classic');
  const [separator, setSeparator] = useState<SeparatorOption>('space');
  const [includeNumber, setIncludeNumber] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [nicknames, setNicknames] = useState<NicknameItem[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const separators: Record<SeparatorOption, string> = useMemo(
    () => ({
      space: ' ',
      dash: '-',
      underscore: '_',
    }),
    [],
  );

  const list = useMemo(() => wordLists[lng] ?? wordLists.en, [lng]);

  const generateNickname = () => {
    const adjective = randomItem(list.adjectives);
    const noun = randomItem(list.nouns);
    const secondNoun = randomItem(list.nouns);
    const number = includeNumber ? `${Math.floor(Math.random() * 90 + 10)}` : '';
    const keywordTrimmed = keyword.trim();

    let parts: string[] = [];

    if (style === 'classic') {
      parts = [adjective, noun];
    } else if (style === 'double') {
      parts = [adjective, noun, secondNoun];
    } else {
      parts = [noun];
    }

    if (number) {
      parts.push(number);
    }

    if (keywordTrimmed) {
      parts.push(keywordTrimmed);
    }

    return parts.filter(Boolean).join(separators[separator]);
  };

  const generateNicknames = () => {
    const safeCount = clampCount(count);
    const items = Array.from({ length: safeCount }, () => ({
      id: createId(),
      value: generateNickname(),
    }));
    setNicknames(items);
  };

  const clearAll = () => {
    setNicknames([]);
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied(null), 1500);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  const handleCopyAll = () => {
    if (!nicknames.length) return;
    handleCopy(nicknames.map((item) => item.value).join('\n'));
  };

  useEffect(() => {
    generateNicknames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lng]);

  return (
    <div className="space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <Text asChild variant="d2" className="text-gray-600 dark:text-gray-300">
            <label htmlFor="nickname-count">{t('label.count')}</label>
          </Text>
          <Input
            id="nickname-count"
            type="number"
            min={COUNT_MIN}
            max={COUNT_MAX}
            value={count}
            onChange={(event) => setCount(clampCount(Number(event.target.value)))}
          />
          <Text variant="c1" color="basic-5">
            {t('helper.count')}
          </Text>
        </div>

        <div className="space-y-2">
          <Text asChild variant="d2" className="text-gray-600 dark:text-gray-300">
            <label htmlFor="style-select">{t('label.style')}</label>
          </Text>
          <Select value={style} onValueChange={(value) => setStyle(value as StyleOption)}>
            <SelectTrigger id="style-select">
              <SelectValue placeholder={t('label.style')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="classic">{t('options.style.classic')}</SelectItem>
              <SelectItem value="double">{t('options.style.double')}</SelectItem>
              <SelectItem value="minimal">{t('options.style.minimal')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Text asChild variant="d2" className="text-gray-600 dark:text-gray-300">
            <label htmlFor="separator-select">{t('label.separator')}</label>
          </Text>
          <Select
            value={separator}
            onValueChange={(value) => setSeparator(value as SeparatorOption)}
          >
            <SelectTrigger id="separator-select">
              <SelectValue placeholder={t('label.separator')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="space">{t('options.separator.space')}</SelectItem>
              <SelectItem value="dash">{t('options.separator.dash')}</SelectItem>
              <SelectItem value="underscore">{t('options.separator.underscore')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Text asChild variant="d2" className="text-gray-600 dark:text-gray-300">
            <label htmlFor="keyword-input">{t('label.keyword')}</label>
          </Text>
          <Input
            id="keyword-input"
            placeholder={t('placeholder.keyword')}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <Text variant="c1" color="basic-5">
            {t('helper.keyword')}
          </Text>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={generateNicknames} className="gap-2 px-4 py-2 text-sm">
            <RefreshCw size={16} />
            {t('button.generate')}
          </Button>
          <Button
            onClick={() => setIncludeNumber((prev) => !prev)}
            className={cn(
              'px-4 py-2 text-sm border border-transparent',
              includeNumber
                ? 'bg-point-2 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
            )}
          >
            {includeNumber ? t('button.numberOn') : t('button.numberOff')}
          </Button>
          <Button
            onClick={handleCopyAll}
            className="gap-2 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            disabled={!nicknames.length}
          >
            <Copy size={16} />
            {t('button.copyAll')}
          </Button>
          <Button
            onClick={clearAll}
            className="gap-2 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
          >
            <Trash2 size={16} />
            {t('button.clear')}
          </Button>
        </div>
        {copied && (
          <Text variant="c1" color="basic-5">
            {t('copied')}
          </Text>
        )}
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'p-4')}>
        {nicknames.length ? (
          <ul className="space-y-2">
            {nicknames.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-white/80 px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-100"
              >
                <span className="break-all">{item.value}</span>
                <Button
                  onClick={() => handleCopy(item.value)}
                  className="ml-2 h-8 w-8 rounded-full p-0 text-xs bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
                >
                  <Copy size={14} />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 py-8 text-gray-400 dark:text-gray-500">
            <Text variant="d2" color="basic-6">
              {t('empty')}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
