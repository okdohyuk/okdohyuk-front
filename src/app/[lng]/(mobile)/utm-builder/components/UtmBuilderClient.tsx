'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, RotateCcw } from 'lucide-react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Textarea } from '@components/basic/Textarea';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface UtmBuilderClientProps {
  lng: Language;
}

type UtmFields = {
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
};

const emptyFields: UtmFields = {
  baseUrl: '',
  source: '',
  medium: '',
  campaign: '',
  term: '',
  content: '',
};

export default function UtmBuilderClient({ lng }: UtmBuilderClientProps) {
  const { t } = useTranslation(lng, 'utm-builder');
  const [fields, setFields] = useState<UtmFields>(emptyFields);
  const [copied, setCopied] = useState(false);

  const { output, error, params } = useMemo(() => {
    if (!fields.baseUrl.trim()) {
      return { output: '', error: '', params: [] as Array<[string, string]> };
    }

    try {
      const url = new URL(fields.baseUrl.trim());
      const nextParams: Array<[string, string]> = [];

      const map: Array<[string, string]> = [
        ['utm_source', fields.source],
        ['utm_medium', fields.medium],
        ['utm_campaign', fields.campaign],
        ['utm_term', fields.term],
        ['utm_content', fields.content],
      ];

      map.forEach(([key, value]) => {
        const trimmed = value.trim();
        if (trimmed) {
          url.searchParams.set(key, trimmed);
          nextParams.push([key, trimmed]);
        }
      });

      return { output: url.toString(), error: '', params: nextParams };
    } catch (err) {
      return { output: '', error: t('output.invalid'), params: [] as Array<[string, string]> };
    }
  }, [fields, t]);

  useEffect(() => {
    setCopied(false);
  }, [output]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy UTM URL:', err);
    }
  };

  const handleClear = () => setFields(emptyFields);

  const handleExample = () => {
    setFields({
      baseUrl: 'https://okdohyuk.dev/blog',
      source: 'newsletter',
      medium: 'email',
      campaign: 'february-update',
      term: 'dev-tools',
      content: 'hero-button',
    });
  };

  const updateField = (key: keyof UtmFields) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFields((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const outputFooter = (() => {
    if (error) {
      return <p className="text-xs text-red-500">{error}</p>;
    }

    if (!output) {
      return <p className="text-xs text-gray-500 dark:text-gray-400">{t('output.empty')}</p>;
    }

    return (
      <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
        <p className="font-medium text-gray-600 dark:text-gray-300">{t('preview.title')}</p>
        <ul className="list-disc space-y-1 pl-4">
          {params.length === 0 ? (
            <li>{t('preview.empty')}</li>
          ) : (
            params.map(([key, value]) => (
              <li key={key} className="font-mono">
                {key}={value}
              </li>
            ))
          )}
        </ul>
      </div>
    );
  })();

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {t('form.title')}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              className="px-3 py-2 text-xs"
              onClick={handleExample}
            >
              {t('button.example')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex items-center gap-2 px-3 py-2 text-xs"
              onClick={handleClear}
            >
              <RotateCcw size={14} />
              {t('button.clear')}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="utm-base-url"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.baseUrl')}
          </label>
          <Input
            id="utm-base-url"
            value={fields.baseUrl}
            onChange={updateField('baseUrl')}
            placeholder={t('placeholder.baseUrl')}
            className="font-mono"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper.baseUrl')}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="utm-source"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.source')}
            </label>
            <Input
              id="utm-source"
              value={fields.source}
              onChange={updateField('source')}
              placeholder={t('placeholder.source')}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="utm-medium"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.medium')}
            </label>
            <Input
              id="utm-medium"
              value={fields.medium}
              onChange={updateField('medium')}
              placeholder={t('placeholder.medium')}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="utm-campaign"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.campaign')}
            </label>
            <Input
              id="utm-campaign"
              value={fields.campaign}
              onChange={updateField('campaign')}
              placeholder={t('placeholder.campaign')}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="utm-term"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.term')}
            </label>
            <Input
              id="utm-term"
              value={fields.term}
              onChange={updateField('term')}
              placeholder={t('placeholder.term')}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="utm-content"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.content')}
            </label>
            <Input
              id="utm-content"
              value={fields.content}
              onChange={updateField('content')}
              placeholder={t('placeholder.content')}
            />
          </div>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {t('output.title')}
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
          value={output}
          readOnly
          rows={4}
          placeholder={t('output.placeholder')}
          className="font-mono"
        />
        {outputFooter}
      </div>
    </div>
  );
}
