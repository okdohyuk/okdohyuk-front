'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';

interface LadderGameProps {
  lng: Language;
}

type LadderRow = {
  id: string;
  cells: boolean[];
};

const parseLines = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const shuffle = <T,>(items: T[]) => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const generateLadderRows = (columns: number, rows: number) => {
  const ladderRows: LadderRow[] = [];

  for (let r = 0; r < rows; r += 1) {
    const cells = Array(Math.max(columns - 1, 0)).fill(false);
    let prevConnected = false;

    for (let c = 0; c < cells.length; c += 1) {
      if (prevConnected) {
        prevConnected = false;
      } else if (Math.random() > 0.55) {
        cells[c] = true;
        prevConnected = true;
      }
    }

    ladderRows.push({ id: createId(), cells });
  }

  return ladderRows;
};

const resolveLadderMapping = (columns: number, ladderRows: LadderRow[]) => {
  const mapping: number[] = [];

  for (let start = 0; start < columns; start += 1) {
    let position = start;

    ladderRows.forEach((row) => {
      if (row.cells[position]) {
        position += 1;
      } else if (position > 0 && row.cells[position - 1]) {
        position -= 1;
      }
    });

    mapping[start] = position;
  }

  return mapping;
};

function LadderPreview({
  participants,
  outcomes,
  ladderRows,
  title,
}: {
  participants: string[];
  outcomes: string[];
  ladderRows: LadderRow[];
  title: string;
}) {
  if (participants.length < 2 || ladderRows.length === 0) return null;

  const participantCounts: Record<string, number> = {};
  const outcomeCounts: Record<string, number> = {};

  const participantEntries = participants.map((name) => {
    participantCounts[name] = (participantCounts[name] ?? 0) + 1;
    return { id: `${name}-${participantCounts[name]}`, name };
  });

  const outcomeEntries = outcomes.map((name) => {
    outcomeCounts[name] = (outcomeCounts[name] ?? 0) + 1;
    return { id: `${name}-${outcomeCounts[name]}`, name };
  });

  return (
    <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
      <h3 className="text-left text-base font-semibold text-slate-100">{title}</h3>
      <div className="overflow-x-auto">
        <div className="min-w-[320px] space-y-2">
          <div
            className="grid gap-2 text-center text-sm font-semibold text-slate-100"
            style={{ gridTemplateColumns: `repeat(${participants.length}, minmax(72px, 1fr))` }}
          >
            {participantEntries.map((entry) => (
              <div key={entry.id} className="rounded-md bg-slate-900/60 px-2 py-1">
                {entry.name}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {ladderRows.map((row) => (
              <div
                key={row.id}
                className="grid items-center"
                style={{ gridTemplateColumns: `repeat(${participants.length}, minmax(72px, 1fr))` }}
              >
                {participantEntries.map((entry, colIndex) => {
                  const hasRight = row.cells[colIndex];
                  return (
                    <div key={entry.id} className="relative h-6">
                      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-slate-500" />
                      {hasRight && (
                        <div className="absolute left-1/2 top-1/2 h-px w-full -translate-y-1/2 bg-slate-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div
            className="grid gap-2 text-center text-sm font-semibold text-point-2"
            style={{ gridTemplateColumns: `repeat(${participants.length}, minmax(72px, 1fr))` }}
          >
            {outcomeEntries.map((entry) => (
              <div key={entry.id} className="rounded-md bg-point-2/20 px-2 py-1">
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LadderGame({ lng }: LadderGameProps) {
  const { t } = useTranslation(lng, 'ladder-game');

  const sampleParticipants = useMemo(() => {
    const sample = t('sampleParticipants', { returnObjects: true }) as string[];
    return Array.isArray(sample) ? sample : ['A', 'B', 'C', 'D'];
  }, [t]);

  const sampleOutcomes = useMemo(() => {
    const sample = t('sampleOutcomes', { returnObjects: true }) as string[];
    return Array.isArray(sample) ? sample : ['1', '2', '3', '4'];
  }, [t]);

  const [participantsText, setParticipantsText] = useState(sampleParticipants.join('\n'));
  const [outcomesText, setOutcomesText] = useState(sampleOutcomes.join('\n'));
  const participantsId = 'ladder-participants';
  const outcomesId = 'ladder-outcomes';
  const [rungCount, setRungCount] = useState(8);
  const [ladderRows, setLadderRows] = useState<LadderRow[]>([]);
  const [results, setResults] = useState<{ participant: string; outcome: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const participants = useMemo(() => parseLines(participantsText), [participantsText]);
  const outcomesRaw = useMemo(() => parseLines(outcomesText), [outcomesText]);

  const normalizedOutcomes = useMemo(() => {
    if (participants.length === 0) return [];
    if (outcomesRaw.length >= participants.length) return outcomesRaw.slice(0, participants.length);

    const filled = [...outcomesRaw];
    for (let i = outcomesRaw.length; i < participants.length; i += 1) {
      filled.push(t('autoOutcome', { index: i + 1 }));
    }
    return filled;
  }, [participants.length, outcomesRaw, t]);

  useEffect(() => {
    setResults([]);
    setLadderRows([]);
    setError(null);
  }, [participantsText, outcomesText, rungCount]);

  const handleDraw = () => {
    if (participants.length < 2) {
      setError(t('needsParticipants'));
      return;
    }

    setError(null);
    const rows = generateLadderRows(participants.length, rungCount);
    const mapping = resolveLadderMapping(participants.length, rows);

    const nextResults = participants.map((participant, index) => ({
      participant,
      outcome: normalizedOutcomes[mapping[index]] ?? '',
    }));

    setLadderRows(rows);
    setResults(nextResults);
  };

  const handleShuffle = () => {
    setParticipantsText(shuffle(participants).join('\n'));
    setOutcomesText(shuffle(outcomesRaw).join('\n'));
  };

  const handleReset = () => {
    setParticipantsText(sampleParticipants.join('\n'));
    setOutcomesText(sampleOutcomes.join('\n'));
    setRungCount(8);
  };

  const mismatchNotice =
    participants.length > 0 && outcomesRaw.length > 0 && participants.length !== outcomesRaw.length;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <ServicePageHeader title={t('title')} description={t('description')} badge="Daily Helper" />

      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-100" htmlFor={participantsId}>
            <span className="font-semibold">{t('participantsLabel')}</span>
            <textarea
              id={participantsId}
              className="min-h-[160px] w-full rounded-lg border border-white/10 bg-slate-950/40 p-3 text-sm text-slate-100"
              placeholder={t('participantsPlaceholder')}
              value={participantsText}
              onChange={(event) => setParticipantsText(event.target.value)}
            />
          </label>

          <label className="space-y-2 text-sm text-slate-100" htmlFor={outcomesId}>
            <span className="font-semibold">{t('outcomesLabel')}</span>
            <textarea
              id={outcomesId}
              className="min-h-[160px] w-full rounded-lg border border-white/10 bg-slate-950/40 p-3 text-sm text-slate-100"
              placeholder={t('outcomesPlaceholder')}
              value={outcomesText}
              onChange={(event) => setOutcomesText(event.target.value)}
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-100">
              <span className="font-semibold">{t('rungCountLabel')}</span>
              <span className="text-xs text-slate-400">{rungCount}</span>
            </div>
            <input
              className="w-full"
              type="range"
              min={3}
              max={16}
              value={rungCount}
              onChange={(event) => setRungCount(Number(event.target.value))}
            />
            <p className="text-xs text-slate-400">{t('rungCountHint')}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" className="button px-4" onClick={handleDraw}>
              {t('drawButton')}
            </button>
            <button type="button" className="button-secondary px-4" onClick={handleShuffle}>
              {t('shuffleButton')}
            </button>
            <button type="button" className="button-ghost px-4" onClick={handleReset}>
              {t('resetButton')}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-rose-300">{error}</p>}

        {mismatchNotice && (
          <p className="rounded-lg bg-slate-900/60 px-3 py-2 text-xs text-slate-300">
            {t('mismatchNotice', {
              participants: participants.length,
              outcomes: outcomesRaw.length,
            })}
          </p>
        )}
      </section>

      {results.length > 0 && (
        <section className={`${SERVICE_PANEL_SOFT} space-y-3 p-4`}>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-100">{t('resultTitle')}</h3>
            <span className="text-xs text-slate-400">
              {t('resultCount', { count: results.length })}
            </span>
          </div>
          <ul className="space-y-2">
            {results.map((item) => (
              <li
                key={`${item.participant}-${item.outcome}`}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
              >
                <span className="text-slate-100">{item.participant}</span>
                <span className="font-semibold text-point-2">{item.outcome}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <LadderPreview
        participants={participants}
        outcomes={normalizedOutcomes}
        ladderRows={ladderRows}
        title={t('previewTitle')}
      />
    </div>
  );
}
