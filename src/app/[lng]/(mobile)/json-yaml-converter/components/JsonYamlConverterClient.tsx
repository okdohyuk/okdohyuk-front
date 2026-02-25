'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { Textarea } from '@components/basic/Textarea';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { ArrowLeftRight, Copy, RefreshCcw, RotateCw, Sparkles } from 'lucide-react';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { parse, stringify } from 'yaml';

interface JsonYamlConverterClientProps {
  lng: Language;
}

type Direction = 'json-to-yaml' | 'yaml-to-json';

const SAMPLE_JSON = `{
  "title": "Amadeus",
  "version": "1.0",
  "features": ["convert", "validate", "copy"],
  "enabled": true
}`;

const SAMPLE_YAML = `title: Amadeus
version: '1.0'
features:
  - convert
  - validate
  - copy
enabled: true
`;

export default function JsonYamlConverterClient({ lng }: JsonYamlConverterClientProps) {
  const { t } = useTranslation(lng, 'json-yaml-converter');
  const [direction, setDirection] = useState<Direction>('json-to-yaml');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const outputPlaceholder = useMemo(() => {
    return direction === 'json-to-yaml'
      ? t('placeholder.output.yaml')
      : t('placeholder.output.json');
  }, [direction, t]);

  const handleConvert = () => {
    setError('');
    setCopied(false);

    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      if (direction === 'json-to-yaml') {
        const parsed = JSON.parse(input);
        setOutput(stringify(parsed).trim());
      } else {
        const parsed = parse(input);
        setOutput(JSON.stringify(parsed, null, 2));
      }
    } catch (convertError) {
      setOutput('');
      setError(direction === 'json-to-yaml' ? t('error.invalidJson') : t('error.invalidYaml'));
    }
  };

  const handleSwap = () => {
    setError('');
    setCopied(false);
    setDirection((prev) => (prev === 'json-to-yaml' ? 'yaml-to-json' : 'json-to-yaml'));
    setInput(output);
    setOutput(input);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!output.trim()) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (copyError) {
      setCopied(false);
    }
  };

  const handleSample = () => {
    setError('');
    setCopied(false);
    setInput(direction === 'json-to-yaml' ? SAMPLE_JSON : SAMPLE_YAML);
    setOutput('');
  };

  return (
    <div className="space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <Text variant="d3" color="basic-4">
              {t('label.direction')}
            </Text>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => setDirection('json-to-yaml')}
                className={cn(
                  'px-3 py-1 text-sm',
                  direction === 'json-to-yaml'
                    ? 'bg-point-2 text-white'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
                )}
              >
                {t('direction.jsonToYaml')}
              </Button>
              <Button
                type="button"
                onClick={() => setDirection('yaml-to-json')}
                className={cn(
                  'px-3 py-1 text-sm',
                  direction === 'yaml-to-json'
                    ? 'bg-point-2 text-white'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
                )}
              >
                {t('direction.yamlToJson')}
              </Button>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleSample}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            <Sparkles size={16} />
            {direction === 'json-to-yaml' ? t('button.sampleJson') : t('button.sampleYaml')}
          </Button>
        </div>
        <div className="space-y-2">
          <Text variant="d3" color="basic-4">
            {t('label.input')}
          </Text>
          <Textarea
            className="min-h-[180px] font-mono text-sm"
            placeholder={t('placeholder.input')}
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </div>
        {error && (
          <Text variant="d3" color="basic-5" className="text-red-500 dark:text-red-400">
            {error}
          </Text>
        )}
        <Text variant="d3" color="basic-5">
          {t('helper')}
        </Text>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={handleConvert}
            className="flex items-center gap-2 px-4 py-2 text-sm"
          >
            <RotateCw size={16} />
            {t('button.convert')}
          </Button>
          <Button
            type="button"
            onClick={handleSwap}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeftRight size={16} />
            {t('button.swap')}
          </Button>
          <Button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            <RefreshCcw size={16} />
            {t('button.clear')}
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Text variant="d3" color="basic-4">
              {t('label.output')}
            </Text>
            <Button
              type="button"
              onClick={handleCopy}
              disabled={!output.trim()}
              className={cn(
                'flex items-center gap-2 px-3 py-1 text-xs',
                output.trim()
                  ? 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-400 dark:bg-gray-900 dark:text-gray-600',
              )}
            >
              <Copy size={14} />
              {copied ? t('button.copied') : t('button.copy')}
            </Button>
          </div>
          <Textarea
            readOnly
            className="min-h-[180px] font-mono text-sm"
            placeholder={outputPlaceholder}
            value={output}
          />
        </div>
      </div>
    </div>
  );
}
