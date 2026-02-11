'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, Eraser, FileJson, Sparkles } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { Textarea } from '@components/basic/Textarea';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface JsonFormatterClientProps {
  lng: Language;
}

const SAMPLE_JSON = `{
  "project": "OpenClaw",
  "version": "1.0.0",
  "features": ["format", "minify", "validate"],
  "meta": { "author": "Amadeus", "year": 2026 }
}`;

export default function JsonFormatterClient({ lng }: JsonFormatterClientProps) {
  const { t } = useTranslation(lng, 'json-formatter');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState<'idle' | 'valid' | 'invalid' | 'empty'>('idle');
  const [errorDetail, setErrorDetail] = useState('');
  const [copied, setCopied] = useState(false);

  const inputLength = useMemo(() => input.length, [input]);
  const outputLength = useMemo(() => output.length, [output]);

  const handleClear = () => {
    setInput('');
    setOutput('');
    setStatus('');
    setStatusType('idle');
    setErrorDetail('');
    setCopied(false);
  };

  const handleSample = () => {
    setInput(SAMPLE_JSON);
    setOutput('');
    setStatus('');
    setStatusType('idle');
    setErrorDetail('');
    setCopied(false);
  };

  const runFormat = (minify = false) => {
    if (!input.trim()) {
      setOutput('');
      setStatus(t('error.empty'));
      setStatusType('empty');
      setErrorDetail('');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, minify ? 0 : 2);
      setOutput(formatted);
      setStatus(t('status.valid'));
      setStatusType('valid');
      setErrorDetail('');
      setCopied(false);
    } catch (error) {
      setOutput('');
      setStatus(t('status.invalid'));
      setStatusType('invalid');
      setErrorDetail(error instanceof Error ? error.message : String(error));
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy JSON output:', error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="json-input"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.input')}
          </label>
          <Text variant="c1" color="basic-6">
            {t('counter', { count: inputLength })}
          </Text>
        </div>
        <Textarea
          id="json-input"
          className="min-h-[160px] font-mono text-sm"
          placeholder={t('placeholder')}
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setStatus('');
            setStatusType('idle');
            setErrorDetail('');
            setCopied(false);
          }}
        />
        <Text variant="c1" color="basic-5">
          {t('helper')}
        </Text>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => runFormat(false)}
            className="flex items-center gap-2 px-3 py-2 text-xs"
          >
            <Sparkles size={16} />
            {t('button.format')}
          </Button>
          <Button
            type="button"
            onClick={() => runFormat(true)}
            className="flex items-center gap-2 px-3 py-2 text-xs"
          >
            <FileJson size={16} />
            {t('button.minify')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSample}
            className="flex items-center gap-2 px-3 py-2 text-xs"
          >
            <Sparkles size={16} />
            {t('button.sample')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="flex items-center gap-2 px-3 py-2 text-xs"
          >
            <Eraser size={16} />
            {t('button.clear')}
          </Button>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-3 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="json-output"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.output')}
          </label>
          <div className="flex items-center gap-3">
            <Text variant="c1" color="basic-6">
              {t('counter', { count: outputLength })}
            </Text>
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
        </div>
        <Textarea
          id="json-output"
          className="min-h-[160px] font-mono text-sm"
          placeholder={t('empty')}
          value={output}
          readOnly
        />
        {status ? (
          <div className="space-y-1">
            <Text variant="c1" color={statusType === 'valid' ? 'basic-4' : 'basic-5'}>
              {status}
            </Text>
            {errorDetail ? (
              <Text variant="c2" color="basic-5">
                {errorDetail}
              </Text>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
