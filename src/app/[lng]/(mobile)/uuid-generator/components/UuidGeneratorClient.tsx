'use client';

import React from 'react';
import { v4 as uuidv4 } from 'uuid';
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
import { Text } from '@components/basic/Text';

const MAX_COUNT = 20;
const MIN_COUNT = 1;

const generateUuidV4 = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return uuidv4();
};

type FormatOption = 'standard' | 'noHyphens' | 'uppercase';

const formatUuid = (uuid: string, format: FormatOption) => {
  switch (format) {
    case 'noHyphens':
      return uuid.replace(/-/g, '');
    case 'uppercase':
      return uuid.toUpperCase();
    default:
      return uuid;
  }
};

const buildUuidList = (count: number, format: FormatOption) => {
  return Array.from({ length: count }, () => formatUuid(generateUuidV4(), format));
};

const clampCount = (value: number) => {
  if (Number.isNaN(value)) return MIN_COUNT;
  return Math.min(Math.max(value, MIN_COUNT), MAX_COUNT);
};

export default function UuidGeneratorClient({ lng }: { lng: Language }) {
  const { t } = useTranslation(lng, 'uuid-generator');
  const [count, setCount] = React.useState(5);
  const [format, setFormat] = React.useState<FormatOption>('standard');
  const [uuids, setUuids] = React.useState<string[]>(() => buildUuidList(5, 'standard'));
  const [copied, setCopied] = React.useState(false);

  const handleGenerate = () => {
    const safeCount = clampCount(count);
    setCount(safeCount);
    setUuids(buildUuidList(safeCount, format));
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!uuids.length) return;
    try {
      await navigator.clipboard.writeText(uuids.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[160px_1fr_180px]">
        <div className="space-y-2">
          <Text className="t-basic-1" variant="t3">
            {t('label.count')}
          </Text>
          <Input
            type="number"
            min={MIN_COUNT}
            max={MAX_COUNT}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
          />
          <Text className="t-basic-1/60" variant="c1">
            {t('helper.count', { max: MAX_COUNT })}
          </Text>
        </div>

        <div className="space-y-2">
          <Text className="t-basic-1" variant="t3">
            {t('label.format')}
          </Text>
          <Select value={format} onValueChange={(value) => setFormat(value as FormatOption)}>
            <SelectTrigger>
              <SelectValue placeholder={t('placeholder.format')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">{t('format.standard')}</SelectItem>
              <SelectItem value="noHyphens">{t('format.noHyphens')}</SelectItem>
              <SelectItem value="uppercase">{t('format.uppercase')}</SelectItem>
            </SelectContent>
          </Select>
          <Text className="t-basic-1/60" variant="c1">
            {t('helper.format')}
          </Text>
        </div>

        <div className="flex flex-col gap-2">
          <Button type="button" onClick={handleGenerate}>
            {t('button.generate')}
          </Button>
          <Button type="button" variant="outline" onClick={handleCopy}>
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Text className="t-basic-1" variant="t3">
          {t('label.output')}
        </Text>
        <Textarea
          className="min-h-[200px]"
          readOnly
          value={uuids.join('\n')}
          placeholder={t('placeholder.output')}
        />
      </div>
    </section>
  );
}
