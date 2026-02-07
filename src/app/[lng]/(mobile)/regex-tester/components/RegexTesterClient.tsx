'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { Text } from '@components/basic/Text';
import { Textarea } from '@components/basic/Textarea';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const FLAG_PATTERN = /^[gimsuyd]*$/;

type MatchResult = {
  value: string;
  index: number;
  groups: Record<string, string> | null;
};

type RegexTesterClientProps = {
  lng: Language;
};

function RegexTesterClient({ lng }: RegexTesterClientProps) {
  const { t } = useTranslation(lng, 'regex-tester');
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testText, setTestText] = useState('');
  const [copied, setCopied] = useState(false);

  const { matches, error } = useMemo(() => {
    if (!pattern.trim()) {
      return { matches: [] as MatchResult[], error: null };
    }

    if (!FLAG_PATTERN.test(flags)) {
      return { matches: [] as MatchResult[], error: t('error.invalidFlags') };
    }

    try {
      const regex = new RegExp(pattern, flags);
      const results: MatchResult[] = [];

      if (regex.global) {
        let match = regex.exec(testText);
        while (match) {
          results.push({
            value: match[0],
            index: match.index,
            groups: match.groups ?? null,
          });
          if (match[0] === '') {
            regex.lastIndex += 1;
          }
          match = regex.exec(testText);
        }
      } else {
        const match = regex.exec(testText);
        if (match) {
          results.push({
            value: match[0],
            index: match.index,
            groups: match.groups ?? null,
          });
        }
      }

      return { matches: results, error: null };
    } catch (err) {
      return { matches: [] as MatchResult[], error: t('error.invalidPattern') };
    }
  }, [flags, pattern, t, testText]);

  const handleClear = () => {
    setPattern('');
    setFlags('g');
    setTestText('');
    setCopied(false);
  };

  const handleExample = () => {
    setPattern('(?<word>\\b\\w{4,}\\b)');
    setFlags('g');
    setTestText(t('example.text'));
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!matches.length) return;
    const content = matches.map((match) => match.value).join('\n');
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={cn(SERVICE_PANEL_SOFT, 'w-full space-y-6 p-4')}>
      <div className="space-y-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="flex-1 space-y-2">
            <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {t('label.pattern')}
            </Text>
            <Input
              value={pattern}
              placeholder={t('placeholder.pattern')}
              onChange={(event) => setPattern(event.target.value)}
            />
          </div>
          <div className="w-full md:w-40 space-y-2">
            <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {t('label.flags')}
            </Text>
            <Input
              value={flags}
              placeholder={t('placeholder.flags')}
              onChange={(event) => setFlags(event.target.value)}
            />
          </div>
        </div>
        {error && <Text className="text-sm text-red-500">{error}</Text>}
      </div>

      <div className="space-y-2">
        <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {t('label.testText')}
        </Text>
        <Textarea
          value={testText}
          onChange={(event) => setTestText(event.target.value)}
          placeholder={t('placeholder.testText')}
          className="min-h-[160px]"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleExample} className="px-3 py-1">
          {t('action.example')}
        </Button>
        <Button
          type="button"
          onClick={handleClear}
          className="px-3 py-1 bg-gray-500 hover:bg-gray-400"
        >
          {t('action.clear')}
        </Button>
        <Button
          type="button"
          onClick={handleCopy}
          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500"
          disabled={!matches.length}
        >
          {copied ? t('action.copied') : t('action.copyMatches')}
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {t('label.results')}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {t('label.matchCount', { count: matches.length })}
          </Text>
        </div>
        <div className="space-y-3">
          {matches.length === 0 && (
            <Text className="text-sm text-gray-500 dark:text-gray-400">{t('empty')}</Text>
          )}
          {matches.map((match, index) => (
            <div
              key={`${match.index}-${match.value}`}
              className="rounded-xl border border-gray-200/70 dark:border-gray-700/70 p-3"
            >
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {t('label.match')} #{index + 1}
              </Text>
              <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {t('label.value')}: <span className="font-mono">{match.value}</span>
              </Text>
              <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('label.index')}: {match.index}
              </Text>
              {match.groups && (
                <div className="mt-2 space-y-1">
                  <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t('label.groups')}
                  </Text>
                  <div className="space-y-1">
                    {Object.entries(match.groups).map(([name, value]) => (
                      <Text key={name} className="text-xs text-gray-500 dark:text-gray-400">
                        {name}: <span className="font-mono">{value}</span>
                      </Text>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RegexTesterClient;
