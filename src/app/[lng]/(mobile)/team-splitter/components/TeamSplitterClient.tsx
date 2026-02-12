'use client';

import React, { useMemo, useState } from 'react';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';
import { Text } from '@components/basic/Text';
import { Textarea } from '@components/basic/Textarea';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const SAMPLE_NAMES = ['Alex', 'Jamie', 'Morgan', 'Riley', 'Casey', 'Taylor', 'Jordan', 'Avery'];

type SplitMode = 'teamCount' | 'teamSize';

type TeamSplitterClientProps = {
  lng: Language;
};

const parseNames = (value: string) =>
  value
    .split(/\n|,/)
    .map((name) => name.trim())
    .filter(Boolean);

const shuffleList = <T,>(list: T[]) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

function TeamSplitterClient({ lng }: TeamSplitterClientProps) {
  const { t } = useTranslation(lng, 'team-splitter');
  const [namesInput, setNamesInput] = useState('');
  const [mode, setMode] = useState<SplitMode>('teamCount');
  const [targetValue, setTargetValue] = useState('2');
  const [teams, setTeams] = useState<string[][]>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const participants = useMemo(() => parseNames(namesInput), [namesInput]);

  const handleShuffle = () => {
    if (participants.length < 2) {
      setError(t('errors.needNames'));
      return;
    }

    const numericValue = Number(targetValue);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      setError(t('errors.invalidNumber'));
      return;
    }

    const requestedTeams =
      mode === 'teamCount'
        ? Math.floor(numericValue)
        : Math.ceil(participants.length / Math.floor(numericValue));

    if (requestedTeams < 2) {
      setError(t('errors.tooFewTeams'));
      return;
    }

    const teamCount = Math.min(requestedTeams, participants.length);
    const shuffled = shuffleList(participants);
    const nextTeams = Array.from({ length: teamCount }, () => [] as string[]);

    shuffled.forEach((name, index) => {
      nextTeams[index % teamCount].push(name);
    });

    setTeams(nextTeams);
    setError('');
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!teams.length) return;
    const output = teams
      .map((team, index) => `${t('results.teamLabel')} ${index + 1}: ${team.join(', ')}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setNamesInput('');
    setMode('teamCount');
    setTargetValue('2');
    setTeams([]);
    setError('');
    setCopied(false);
  };

  return (
    <div className="space-y-4">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <Text variant="d2" color="basic-4">
            {t('labels.names')}
          </Text>
          <Textarea
            value={namesInput}
            onChange={(event) => {
              setNamesInput(event.target.value);
              setTeams([]);
              setError('');
            }}
            rows={6}
            placeholder={t('placeholder')}
          />
          <Text variant="c1" color="basic-5">
            {t('helper')}
          </Text>
        </div>

        <div className="grid gap-4 md:grid-cols-[180px,1fr]">
          <div className="space-y-2">
            <Text variant="d2" color="basic-4">
              {t('labels.mode')}
            </Text>
            <Select
              value={mode}
              onValueChange={(value) => {
                setMode(value as SplitMode);
                setTeams([]);
                setError('');
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teamCount">{t('modes.teamCount')}</SelectItem>
                <SelectItem value="teamSize">{t('modes.teamSize')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Text variant="d2" color="basic-4">
              {mode === 'teamCount' ? t('labels.teamCount') : t('labels.teamSize')}
            </Text>
            <Input
              type="number"
              min={mode === 'teamCount' ? 2 : 1}
              value={targetValue}
              onChange={(event) => {
                setTargetValue(event.target.value);
                setTeams([]);
                setError('');
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleShuffle}>
            {teams.length ? t('buttons.reshuffle') : t('buttons.split')}
          </Button>
          <Button
            type="button"
            className="bg-zinc-500 hover:bg-zinc-400"
            onClick={() => {
              setNamesInput(SAMPLE_NAMES.join('\n'));
              setTeams([]);
              setError('');
            }}
          >
            {t('buttons.sample')}
          </Button>
          <Button type="button" className="bg-zinc-600 hover:bg-zinc-500" onClick={handleReset}>
            {t('buttons.reset')}
          </Button>
          <Button
            type="button"
            className="bg-zinc-700 hover:bg-zinc-600"
            onClick={handleCopy}
            disabled={!teams.length}
          >
            {copied ? t('buttons.copied') : t('buttons.copy')}
          </Button>
        </div>

        {error ? (
          <Text variant="d3" color="basic-4" className="text-red-500">
            {error}
          </Text>
        ) : null}

        <div className="flex flex-wrap gap-3 text-sm text-zinc-500 dark:text-zinc-400">
          <Text variant="c1" color="basic-5">
            {t('status.participants')} {participants.length}
          </Text>
          <Text variant="c1" color="basic-5">
            {t('status.teams')} {teams.length}
          </Text>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text variant="d2" color="basic-3">
          {t('results.title')}
        </Text>
        {teams.length ? (
          <div className="space-y-3">
            {teams.map((team, index) => (
              <div key={`team-${team.join('-')}`} className="space-y-1">
                <Text variant="d3" color="basic-2">
                  {t('results.teamLabel')} {index + 1}
                </Text>
                <Text variant="d2" color="basic-4">
                  {team.join(', ')}
                </Text>
              </div>
            ))}
          </div>
        ) : (
          <Text variant="d3" color="basic-5">
            {t('results.empty')}
          </Text>
        )}
      </section>
    </div>
  );
}

export default TeamSplitterClient;
