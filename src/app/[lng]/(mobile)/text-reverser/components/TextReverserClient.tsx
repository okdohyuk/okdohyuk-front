'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Textarea } from '@components/basic/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

type ReverseMode = 'characters' | 'words' | 'lines';

interface TextReverserClientProps {
  lng: Language;
}

export default function TextReverserClient({ lng }: TextReverserClientProps) {
  const { t } = useTranslation(lng, 'text-reverser');
  const [value, setValue] = useState('');
  const [mode, setMode] = useState<ReverseMode>('characters');
  const [copied, setCopied] = useState(false);

  const reversed = useMemo(() => {
    if (!value) return '';

    if (mode === 'lines') {
      return value.split(/\r?\n/).reverse().join('\n');
    }

    if (mode === 'words') {
      const trimmed = value.trim();
      if (!trimmed) return '';
      return trimmed.split(/\s+/).reverse().join(' ');
    }

    return value.split('').reverse().join('');
  }, [mode, value]);

  useEffect(() => {
    setCopied(false);
  }, [reversed]);

  const handleCopy = async () => {
    if (!reversed) return;
    try {
      await navigator.clipboard.writeText(reversed);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy reversed text:', error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label htmlFor="text-reverser-mode" className="text-sm font-medium t-basic-1">
          {t('mode.label')}
        </label>
        <Select value={mode} onValueChange={(next) => setMode(next as ReverseMode)}>
          <SelectTrigger id="text-reverser-mode">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="characters">{t('mode.characters')}</SelectItem>
            <SelectItem value="words">{t('mode.words')}</SelectItem>
            <SelectItem value="lines">{t('mode.lines')}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label htmlFor="text-reverser-input" className="text-sm font-medium t-basic-1">
          {t('label.input')}
        </label>
        <Textarea
          id="text-reverser-input"
          className="h-32 resize-none"
          placeholder={t('placeholder')}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="text-reverser-output" className="text-sm font-medium t-basic-1">
            {t('label.output')}
          </label>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!reversed}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
        <Textarea
          id="text-reverser-output"
          className="h-32 resize-none"
          value={reversed}
          readOnly
          placeholder={t('empty')}
        />
      </section>
    </div>
  );
}
