'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { Textarea } from '@components/basic/Textarea';
import { H1, Text } from '@components/basic/Text';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { Copy, Shuffle, Trash2 } from 'lucide-react';

type SecretSantaClientProps = {
  lng: Language;
};

type Pair = {
  giver: string;
  receiver: string;
  theme?: string;
};

const MAX_ATTEMPTS = 1500;

const normalize = (value: string) => value.trim();

const parseUniqueLines = (value: string) => {
  const entries = value
    .split('\n')
    .map((item) => normalize(item))
    .filter(Boolean);
  const seen = new Map<string, string>();
  entries.forEach((entry) => {
    const key = entry.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, entry);
    }
  });
  return Array.from(seen.values());
};

const parseExclusions = (value: string, participants: string[]) => {
  const participantMap = new Map(participants.map((name) => [name.toLowerCase(), name]));
  const exclusions = new Set<string>();
  const warnings: string[] = [];

  value
    .split('\n')
    .map((line) => normalize(line))
    .filter(Boolean)
    .forEach((line) => {
      const [giverRaw, receiverRaw] = line.split(/->|→|,|>/).map((part) => normalize(part));
      if (!giverRaw || !receiverRaw) {
        return;
      }
      const giver = participantMap.get(giverRaw.toLowerCase());
      const receiver = participantMap.get(receiverRaw.toLowerCase());
      if (!giver || !receiver) {
        warnings.push(line);
        return;
      }
      exclusions.add(`${giver.toLowerCase()}__${receiver.toLowerCase()}`);
    });

  return { exclusions, warnings };
};

const createPairs = (participants: string[], exclusions: Set<string>) => {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const receivers = [...participants];
    for (let i = receivers.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
    }

    const pairs = participants.map((giver, index) => ({
      giver,
      receiver: receivers[index],
    }));

    const isValid = pairs.every((pair) => {
      if (pair.giver.toLowerCase() === pair.receiver.toLowerCase()) {
        return false;
      }
      return !exclusions.has(`${pair.giver.toLowerCase()}__${pair.receiver.toLowerCase()}`);
    });

    if (isValid) {
      return pairs;
    }
  }
  return null;
};

export default function SecretSantaClient({ lng }: SecretSantaClientProps) {
  const { t } = useTranslation(lng, 'secret-santa');
  const [participantsText, setParticipantsText] = useState('');
  const [exclusionsText, setExclusionsText] = useState('');
  const [themesText, setThemesText] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [selectedGiver, setSelectedGiver] = useState('');

  const budgetLabel = useMemo(() => {
    const min = Number(budgetMin.replace(/,/g, ''));
    const max = Number(budgetMax.replace(/,/g, ''));
    if (!budgetMin || !budgetMax || Number.isNaN(min) || Number.isNaN(max)) {
      return '';
    }
    return `${min.toLocaleString()} ~ ${max.toLocaleString()}`;
  }, [budgetMin, budgetMax]);

  const handleGenerate = () => {
    setErrorMessage('');

    const participants = parseUniqueLines(participantsText);
    if (participants.length < 2) {
      setErrorMessage(t('errors.notEnough'));
      setPairs([]);
      return;
    }

    const min = Number(budgetMin.replace(/,/g, ''));
    const max = Number(budgetMax.replace(/,/g, ''));
    if (budgetMin && budgetMax && !Number.isNaN(min) && !Number.isNaN(max) && min > max) {
      setErrorMessage(t('errors.budgetRange'));
      return;
    }

    const { exclusions, warnings: exclusionWarnings } = parseExclusions(
      exclusionsText,
      participants,
    );
    setWarnings(exclusionWarnings);

    const basePairs = createPairs(participants, exclusions);
    if (!basePairs) {
      setErrorMessage(t('errors.noSolution'));
      setPairs([]);
      return;
    }

    const themes = parseUniqueLines(themesText);
    const themedPairs = basePairs.map((pair, index) => ({
      ...pair,
      theme: themes.length ? themes[index % themes.length] : undefined,
    }));

    setPairs(themedPairs);
    setSelectedGiver('');
  };

  const handleClear = () => {
    setParticipantsText('');
    setExclusionsText('');
    setThemesText('');
    setBudgetMin('');
    setBudgetMax('');
    setPairs([]);
    setErrorMessage('');
    setWarnings([]);
    setSelectedGiver('');
  };

  const formatThemeSuffix = (theme?: string) => (theme ? t('messages.themeSuffix', { theme }) : '');

  const pairsText = pairs
    .map((pair) =>
      t('messages.pairLine', {
        giver: pair.giver,
        receiver: pair.receiver,
        theme: formatThemeSuffix(pair.theme),
      }),
    )
    .join('\n');

  const messagesText = pairs
    .map((pair) =>
      t('messages.personalLine', {
        giver: pair.giver,
        receiver: pair.receiver,
        theme: formatThemeSuffix(pair.theme),
      }),
    )
    .join('\n');

  const selectedPair = pairs.find((pair) => pair.giver === selectedGiver);

  const copyToClipboard = async (value: string) => {
    if (!value) return;
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  const revealMessage = selectedPair
    ? t('messages.reveal', {
        giver: selectedPair.giver,
        receiver: selectedPair.receiver,
        theme: formatThemeSuffix(selectedPair.theme),
      })
    : '';

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <H1 className="text-2xl md:text-3xl">{t('sections.setup')}</H1>
          <Text color="basic-4">{t('helpers.participants')}</Text>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="participants"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('labels.participants')}
            </label>
            <Textarea
              id="participants"
              rows={6}
              value={participantsText}
              placeholder={t('placeholders.participants')}
              onChange={(event) => setParticipantsText(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="exclusions"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('labels.exclusions')}
            </label>
            <Textarea
              id="exclusions"
              rows={6}
              value={exclusionsText}
              placeholder={t('placeholders.exclusions')}
              onChange={(event) => setExclusionsText(event.target.value)}
            />
            <Text className="text-xs" color="basic-5">
              {t('helpers.exclusions')}
            </Text>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="themes"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('labels.themes')}
            </label>
            <Textarea
              id="themes"
              rows={4}
              value={themesText}
              placeholder={t('placeholders.themes')}
              onChange={(event) => setThemesText(event.target.value)}
            />
            <Text className="text-xs" color="basic-5">
              {t('helpers.themes')}
            </Text>
          </div>
          <div className="space-y-2">
            <Text asChild className="text-sm font-medium text-gray-700 dark:text-gray-300">
              <span>{t('labels.budget')}</span>
            </Text>
            <div className="grid grid-cols-2 gap-3">
              <Input
                inputMode="numeric"
                placeholder={t('placeholders.budgetMin')}
                value={budgetMin}
                onChange={(event) => setBudgetMin(event.target.value)}
              />
              <Input
                inputMode="numeric"
                placeholder={t('placeholders.budgetMax')}
                value={budgetMax}
                onChange={(event) => setBudgetMax(event.target.value)}
              />
            </div>
            <Text className="text-xs" color="basic-5">
              {t('helpers.budget')}
            </Text>
          </div>
        </div>
        {errorMessage ? <Text className="text-sm text-red-500">{errorMessage}</Text> : null}
        {warnings.length ? (
          <Text className="text-xs text-amber-500">
            {t('warnings.exclusions')}: {warnings.join(', ')}
          </Text>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleGenerate} className="flex items-center gap-2">
            <Shuffle size={16} />
            {pairs.length ? t('buttons.shuffle') : t('buttons.generate')}
          </Button>
          <Button
            onClick={handleClear}
            className="flex items-center gap-2 bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            <Trash2 size={16} />
            {t('buttons.clear')}
          </Button>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <H1 className="text-2xl md:text-3xl">{t('sections.results')}</H1>
          <Text color="basic-4">{t('helpers.results')}</Text>
        </div>
        {budgetLabel ? (
          <Text className="text-sm" color="basic-3">
            {t('result.budget')}: {budgetLabel}
          </Text>
        ) : null}
        {pairs.length ? (
          <div className="space-y-3">
            <div className="grid gap-2">
              {pairs.map((pair) => (
                <div
                  key={`${pair.giver}-${pair.receiver}`}
                  className="flex flex-wrap items-center justify-between rounded-2xl border border-zinc-200/70 bg-white/70 p-3 text-sm shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/70"
                >
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{pair.giver}</span>
                  <span className="text-zinc-500">→</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {pair.receiver}
                  </span>
                  {pair.theme ? (
                    <span className="text-xs text-point-2">
                      {t('result.theme')}: {pair.theme}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={async () => {
                  await copyToClipboard(pairsText);
                }}
                className="flex items-center gap-2"
              >
                <Copy size={16} />
                {t('buttons.copyPairs')}
              </Button>
              <Button
                onClick={async () => {
                  await copyToClipboard(messagesText);
                }}
                className="flex items-center gap-2 bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                <Copy size={16} />
                {t('buttons.copyMessages')}
              </Button>
            </div>
          </div>
        ) : (
          <Text color="basic-5">{t('result.empty')}</Text>
        )}
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <H1 className="text-2xl md:text-3xl">{t('sections.reveal')}</H1>
          <Text color="basic-4">{t('helpers.reveal')}</Text>
        </div>
        <Select value={selectedGiver} onValueChange={setSelectedGiver}>
          <SelectTrigger>
            <SelectValue placeholder={t('placeholders.select')} />
          </SelectTrigger>
          <SelectContent>
            {pairs.map((pair) => (
              <SelectItem key={pair.giver} value={pair.giver}>
                {pair.giver}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedPair ? (
          <div className="space-y-2">
            <Text className="text-sm" color="basic-3">
              {revealMessage}
            </Text>
            <Button
              onClick={async () => {
                await copyToClipboard(revealMessage);
              }}
              className="flex items-center gap-2"
            >
              <Copy size={16} />
              {t('buttons.copyReveal')}
            </Button>
          </div>
        ) : (
          <Text color="basic-5">{t('result.revealEmpty')}</Text>
        )}
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <H1 className="text-2xl md:text-3xl">{t('sections.tips')}</H1>
        <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
          <li>{t('tips.first')}</li>
          <li>{t('tips.second')}</li>
          <li>{t('tips.third')}</li>
        </ul>
      </div>
    </div>
  );
}
