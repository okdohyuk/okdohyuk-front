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
import GoogleAd from '@components/google/GoogleAd';
import { useToolTracking } from '@hooks/analytics/useToolTracking';

interface SlugGeneratorClientProps {
  lng: Language;
}

export default function SlugGeneratorClient({ lng }: SlugGeneratorClientProps) {
  const { t } = useTranslation(lng, 'slug-generator');
  const [value, setValue] = useState('');
  const [copied, setCopied] = useState(false);
  const { trackInputStarted, trackUse, trackCopy } = useToolTracking('slug-generator', 'generator');
  const convertedRef = React.useRef(false);

  const slug = useMemo(() => {
    if (!value) return '';
    const normalized = StringUtils.toUrlSlug(value.trim());
    return normalized.replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  }, [value]);

  useEffect(() => {
    setCopied(false);
    if (slug && !convertedRef.current) {
      convertedRef.current = true;
      trackUse({ action_type: 'convert', success: true });
    }
    if (!slug) {
      convertedRef.current = false;
    }
  }, [slug, trackUse]);

  const handleCopy = async () => {
    if (!slug) return;
    try {
      await navigator.clipboard.writeText(slug);
      setCopied(true);
      trackCopy({ result_format: 'text' });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy slug:', error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label htmlFor="slug-input" className="text-sm font-medium text-fg-3">
          {t('label.input')}
        </label>
        <Input
          id="slug-input"
          className="font-mono"
          placeholder={t('placeholder')}
          value={value}
          onChange={(event) => {
            trackInputStarted();
            setValue(event.target.value);
          }}
        />
        <p className="text-xs text-fg-5">{t('helper')}</p>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="slug-output" className="text-sm font-medium text-fg-3">
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
      {slug && <GoogleAd slotId="7911066601" className="w-full mt-4" />}
    </div>
  );
}
