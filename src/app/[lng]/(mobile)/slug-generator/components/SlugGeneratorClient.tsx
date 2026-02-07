'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck } from 'lucide-react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { cn } from '@utils/cn';
import StringUtils from '@utils/stringUtils';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface SlugGeneratorClientProps {
  lng: Language;
}

export default function SlugGeneratorClient({ lng }: SlugGeneratorClientProps) {
  const { t } = useTranslation(lng, 'slug-generator');
  const [value, setValue] = useState('');
  const [copied, setCopied] = useState(false);

  const slug = useMemo(() => {
    if (!value) return '';
    const normalized = StringUtils.toUrlSlug(value.trim());
    return normalized.replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  }, [value]);

  useEffect(() => {
    setCopied(false);
  }, [slug]);

  const handleCopy = async () => {
    if (!slug) return;
    try {
      await navigator.clipboard.writeText(slug);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy slug:', error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="slug-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.input')}
        </label>
        <Input
          id="slug-input"
          className="font-mono"
          placeholder={t('placeholder')}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="slug-output"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.output')}
          </label>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!slug}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
        <Input
          id="slug-output"
          className="font-mono"
          value={slug}
          readOnly
          placeholder={t('empty')}
        />
      </div>
    </div>
  );
}
