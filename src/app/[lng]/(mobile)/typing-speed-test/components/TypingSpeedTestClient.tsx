'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Button } from '@components/basic/Button';
import { Textarea } from '@components/basic/Textarea';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { Clipboard, RotateCcw, Shuffle } from 'lucide-react';

interface TypingSpeedTestClientProps {
  lng: Language;
}

const formatTime = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, '0');
  const remainSeconds = String(safeSeconds % 60).padStart(2, '0');
  return `${minutes}:${remainSeconds}`;
};

export default function TypingSpeedTestClient({ lng }: TypingSpeedTestClientProps) {
  const { t } = useTranslation(lng, 'typing-speed-test');
  const samples = useMemo(() => {
    const value = t('samples', { returnObjects: true }) as string[] | undefined;
    return Array.isArray(value) ? value : [];
  }, [t]);

  const [sampleIndex, setSampleIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const sampleText = samples[sampleIndex] ?? '';
  const sampleCharacters = useMemo(
    () =>
      sampleText.split('').map((char, index) => ({
        id: `${sampleText}-${index}-${char}`,
        char,
        index,
      })),
    [sampleText],
  );

  useEffect(() => {
    if (samples.length) {
      setSampleIndex(0);
    }
  }, [samples.length]);

  useEffect(() => {
    if (!isRunning || startTime === null) {
      return undefined;
    }
    const interval = setInterval(() => {
      setElapsedSeconds((Date.now() - startTime) / 1000);
    }, 200);
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const resetSession = useCallback(() => {
    setInputValue('');
    setStartTime(null);
    setElapsedSeconds(0);
    setIsRunning(false);
    setIsFinished(false);
  }, []);

  const handleNewSample = useCallback(() => {
    if (!samples.length) {
      return;
    }
    const offset = samples.length === 1 ? 0 : 1 + Math.floor(Math.random() * (samples.length - 1));
    const nextIndex = (sampleIndex + offset) % samples.length;
    setSampleIndex(nextIndex);
    resetSession();
  }, [samples, sampleIndex, resetSession]);

  const handleInputChange = (value: string) => {
    if (!sampleText) {
      return;
    }
    let nextStartTime = startTime;
    if (!nextStartTime) {
      nextStartTime = Date.now();
      setStartTime(nextStartTime);
      setIsRunning(true);
      setIsFinished(false);
    }

    const isComplete = value.length >= sampleText.length;
    if (isComplete) {
      setIsRunning(false);
      setIsFinished(true);
      setElapsedSeconds((Date.now() - nextStartTime) / 1000);
    }

    setInputValue(value);
  };

  const correctCharacters = useMemo(() => {
    if (!inputValue) {
      return 0;
    }
    let count = 0;
    for (let index = 0; index < inputValue.length; index += 1) {
      if (inputValue[index] === sampleText[index]) {
        count += 1;
      }
    }
    return count;
  }, [inputValue, sampleText]);

  const totalCharacters = sampleText.length;
  const typedCharacters = inputValue.length;
  const accuracy = typedCharacters > 0 ? (correctCharacters / typedCharacters) * 100 : 100;
  const minutes = elapsedSeconds > 0 ? elapsedSeconds / 60 : 0;
  const wpm = minutes > 0 ? Math.round(correctCharacters / 5 / minutes) : 0;

  let statusLabel = t('status.ready');
  if (isFinished) {
    statusLabel = t('status.done');
  } else if (isRunning) {
    statusLabel = t('status.running');
  }

  const copyResult = async () => {
    const resultText = t('result.format', {
      wpm,
      accuracy: accuracy.toFixed(1),
      time: formatTime(elapsedSeconds),
      correct: correctCharacters,
      total: totalCharacters,
    });
    try {
      await navigator.clipboard.writeText(resultText);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('copy failed', error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Text asChild variant="d2" color="basic-4">
              <p>{t('labels.sample')}</p>
            </Text>
            <Text asChild variant="d1" color="basic-1">
              <p className="mt-2 whitespace-pre-wrap leading-relaxed">
                {sampleCharacters.map(({ id, char, index }) => {
                  const typedChar = inputValue[index];
                  const isTyped = index < inputValue.length;
                  const isCorrect = typedChar === char;
                  let className = 'text-zinc-400 dark:text-zinc-500';
                  if (isTyped && isCorrect) {
                    className = 'text-emerald-600';
                  } else if (isTyped && !isCorrect) {
                    className = 'text-rose-500';
                  }
                  const displayChar = char === ' ' ? '\u00A0' : char;
                  return (
                    <span key={id} className={className}>
                      {displayChar}
                    </span>
                  );
                })}
              </p>
            </Text>
          </div>
          <Button
            onClick={handleNewSample}
            className="flex items-center gap-2 px-3 py-2 text-xs bg-zinc-200 hover:bg-zinc-300 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100"
          >
            <Shuffle size={14} />
            {t('buttons.newSample')}
          </Button>
        </div>
        <Text asChild variant="c1" color="basic-5">
          <p>{t('helper')}</p>
        </Text>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text asChild variant="d2" color="basic-4">
          <label htmlFor="typing-input">{t('labels.input')}</label>
        </Text>
        <Textarea
          id="typing-input"
          placeholder={t('placeholder')}
          value={inputValue}
          onChange={(event) => handleInputChange(event.target.value)}
          className="min-h-[160px]"
        />
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between">
          <Text asChild variant="d2" color="basic-4">
            <p>{t('labels.status')}</p>
          </Text>
          <Text asChild variant="d2" color="basic-1">
            <p>{statusLabel}</p>
          </Text>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-3 dark:border-zinc-700/70 dark:bg-zinc-900/70">
            <Text asChild variant="c1" color="basic-5">
              <p>{t('labels.time')}</p>
            </Text>
            <Text asChild variant="t3" color="basic-1">
              <p>{formatTime(elapsedSeconds)}</p>
            </Text>
          </div>
          <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-3 dark:border-zinc-700/70 dark:bg-zinc-900/70">
            <Text asChild variant="c1" color="basic-5">
              <p>{t('labels.wpm')}</p>
            </Text>
            <Text asChild variant="t3" color="basic-1">
              <p>{wpm}</p>
            </Text>
          </div>
          <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-3 dark:border-zinc-700/70 dark:bg-zinc-900/70">
            <Text asChild variant="c1" color="basic-5">
              <p>{t('labels.accuracy')}</p>
            </Text>
            <Text asChild variant="t3" color="basic-1">
              <p>{accuracy.toFixed(1)}%</p>
            </Text>
          </div>
          <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-3 dark:border-zinc-700/70 dark:bg-zinc-900/70">
            <Text asChild variant="c1" color="basic-5">
              <p>{t('labels.progress')}</p>
            </Text>
            <Text asChild variant="t3" color="basic-1">
              <p>
                {typedCharacters}/{totalCharacters}
              </p>
            </Text>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={resetSession} className="flex items-center gap-2 px-4 py-2 text-sm">
            <RotateCcw size={16} />
            {t('buttons.reset')}
          </Button>
          <Button
            onClick={copyResult}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-200 hover:bg-zinc-300 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100"
          >
            <Clipboard size={16} />
            {t('buttons.copyResult')}
          </Button>
        </div>
      </section>
    </div>
  );
}
