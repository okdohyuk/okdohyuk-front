'use client';

import React, { useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';

import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const titleCase = (value: string) =>
  value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

const sentenceCase = (value: string) =>
  value.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (char) => char.toUpperCase());

const trimLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .join('\n');

const removeEmptyLines = (value: string) =>
  value
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '')
    .join('\n');

const collapseSpaces = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .join('\n');

const copyToClipboard = async (value: string, onCopied: (copied: boolean) => void) => {
  if (!value) return;
  await navigator.clipboard.writeText(value);
  onCopied(true);
  setTimeout(() => onCopied(false), 1200);
};

interface TextToolboxClientProps {
  lng: Language;
}

function TextToolboxClient({ lng }: TextToolboxClientProps) {
  const { t } = useTranslation(lng, 'text-toolbox');

  const [caseInput, setCaseInput] = useState('');
  const [caseOutput, setCaseOutput] = useState('');
  const [caseCopied, setCaseCopied] = useState(false);

  const [cleanInput, setCleanInput] = useState('');
  const [cleanOutput, setCleanOutput] = useState('');
  const [cleanCopied, setCleanCopied] = useState(false);

  const [counterInput, setCounterInput] = useState('');

  const counterStats = useMemo(() => {
    const trimmed = counterInput.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const lines = counterInput ? counterInput.split(/\r?\n/).length : 0;
    const characters = counterInput.length;
    const charactersNoSpace = counterInput.replace(/\s/g, '').length;

    return { words, lines, characters, charactersNoSpace };
  }, [counterInput]);

  return (
    <div className="space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {t('sections.case.title')}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {t('sections.case.description')}
          </p>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="case-input"
            className="text-sm font-semibold text-zinc-700 dark:text-zinc-200"
          >
            {t('sections.case.inputLabel')}
          </label>
          <Textarea
            id="case-input"
            className="min-h-[120px]"
            placeholder={t('sections.case.placeholder')}
            value={caseInput}
            onChange={(event) => setCaseInput(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => setCaseOutput(caseInput.toUpperCase())}>
            {t('sections.case.actions.upper')}
          </Button>
          <Button type="button" onClick={() => setCaseOutput(caseInput.toLowerCase())}>
            {t('sections.case.actions.lower')}
          </Button>
          <Button type="button" onClick={() => setCaseOutput(titleCase(caseInput))}>
            {t('sections.case.actions.title')}
          </Button>
          <Button type="button" onClick={() => setCaseOutput(sentenceCase(caseInput))}>
            {t('sections.case.actions.sentence')}
          </Button>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="case-output"
            className="text-sm font-semibold text-zinc-700 dark:text-zinc-200"
          >
            {t('sections.case.outputLabel')}
          </label>
          <Textarea
            id="case-output"
            className="min-h-[120px]"
            placeholder={t('sections.case.outputPlaceholder')}
            value={caseOutput}
            readOnly
          />
          <Button
            type="button"
            disabled={!caseOutput}
            onClick={() => copyToClipboard(caseOutput, setCaseCopied)}
            className="gap-2"
          >
            {caseCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {caseCopied ? t('sections.case.copied') : t('sections.case.copy')}
          </Button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {t('sections.clean.title')}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {t('sections.clean.description')}
          </p>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="clean-input"
            className="text-sm font-semibold text-zinc-700 dark:text-zinc-200"
          >
            {t('sections.clean.inputLabel')}
          </label>
          <Textarea
            id="clean-input"
            className="min-h-[120px]"
            placeholder={t('sections.clean.placeholder')}
            value={cleanInput}
            onChange={(event) => setCleanInput(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => setCleanOutput(trimLines(cleanInput))}>
            {t('sections.clean.actions.trim')}
          </Button>
          <Button type="button" onClick={() => setCleanOutput(removeEmptyLines(cleanInput))}>
            {t('sections.clean.actions.removeEmpty')}
          </Button>
          <Button type="button" onClick={() => setCleanOutput(collapseSpaces(cleanInput))}>
            {t('sections.clean.actions.collapse')}
          </Button>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="clean-output"
            className="text-sm font-semibold text-zinc-700 dark:text-zinc-200"
          >
            {t('sections.clean.outputLabel')}
          </label>
          <Textarea
            id="clean-output"
            className="min-h-[120px]"
            placeholder={t('sections.clean.outputPlaceholder')}
            value={cleanOutput}
            readOnly
          />
          <Button
            type="button"
            disabled={!cleanOutput}
            onClick={() => copyToClipboard(cleanOutput, setCleanCopied)}
            className="gap-2"
          >
            {cleanCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {cleanCopied ? t('sections.clean.copied') : t('sections.clean.copy')}
          </Button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {t('sections.counter.title')}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {t('sections.counter.description')}
          </p>
        </div>
        <Textarea
          className="min-h-[120px]"
          placeholder={t('sections.counter.placeholder')}
          value={counterInput}
          onChange={(event) => setCounterInput(event.target.value)}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white/80 p-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-200">
            <div className="text-xs uppercase text-zinc-400">
              {t('sections.counter.metrics.characters')}
            </div>
            <div className="text-lg font-bold">{counterStats.characters}</div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white/80 p-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-200">
            <div className="text-xs uppercase text-zinc-400">
              {t('sections.counter.metrics.charactersNoSpace')}
            </div>
            <div className="text-lg font-bold">{counterStats.charactersNoSpace}</div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white/80 p-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-200">
            <div className="text-xs uppercase text-zinc-400">
              {t('sections.counter.metrics.words')}
            </div>
            <div className="text-lg font-bold">{counterStats.words}</div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white/80 p-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-200">
            <div className="text-xs uppercase text-zinc-400">
              {t('sections.counter.metrics.lines')}
            </div>
            <div className="text-lg font-bold">{counterStats.lines}</div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TextToolboxClient;
