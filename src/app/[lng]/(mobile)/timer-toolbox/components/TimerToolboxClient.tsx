'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { H2, H3, Text } from '@components/basic/Text';
import { cn } from '@utils/cn';

type Mode = 'stopwatch' | 'countdown';

type LapEntry = {
  id: string;
  value: number;
};

const formatDuration = (ms: number, withMs = true) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);

  const base = [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');

  if (!withMs) return base;
  return `${base}.${String(centiseconds).padStart(2, '0')}`;
};

const sanitizeNumberInput = (value: string, maxLength = 2) => {
  const sanitized = value.replace(/[^\d]/g, '').slice(0, maxLength);
  return sanitized;
};

const toSeconds = (hours: string, minutes: string, seconds: string) => {
  const h = Number(hours || 0);
  const m = Number(minutes || 0);
  const s = Number(seconds || 0);
  return h * 3600 + m * 60 + s;
};

export default function TimerToolboxClient({ lng }: { lng: Language }) {
  const { t } = useTranslation(lng, 'timer-toolbox');
  const [mode, setMode] = useState<Mode>('stopwatch');

  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchMs, setStopwatchMs] = useState(0);
  const stopwatchStartRef = useRef<number | null>(null);
  const stopwatchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lapIdRef = useRef(1);
  const [laps, setLaps] = useState<LapEntry[]>([]);

  const [countdownRunning, setCountdownRunning] = useState(false);
  const [countdownMs, setCountdownMs] = useState(0);
  const countdownEndRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [hoursInput, setHoursInput] = useState('');
  const [minutesInput, setMinutesInput] = useState('05');
  const [secondsInput, setSecondsInput] = useState('00');
  const [countdownError, setCountdownError] = useState('');

  const [copyMessage, setCopyMessage] = useState('');

  const clearCopyMessage = useCallback(() => {
    setCopyMessage('');
  }, []);

  useEffect(() => {
    if (!copyMessage) return undefined;
    const timer = window.setTimeout(clearCopyMessage, 1200);
    return () => window.clearTimeout(timer);
  }, [copyMessage, clearCopyMessage]);

  useEffect(() => {
    if (!stopwatchRunning) return undefined;

    stopwatchStartRef.current = Date.now() - stopwatchMs;
    stopwatchTimerRef.current = setInterval(() => {
      if (stopwatchStartRef.current === null) return;
      setStopwatchMs(Date.now() - stopwatchStartRef.current);
    }, 80);

    return () => {
      if (stopwatchTimerRef.current) clearInterval(stopwatchTimerRef.current);
      stopwatchTimerRef.current = null;
    };
  }, [stopwatchRunning, stopwatchMs]);

  useEffect(() => {
    if (!countdownRunning) return undefined;

    if (!countdownEndRef.current) {
      countdownEndRef.current = Date.now() + countdownMs;
    }

    countdownTimerRef.current = setInterval(() => {
      if (!countdownEndRef.current) return;
      const remaining = countdownEndRef.current - Date.now();
      if (remaining <= 0) {
        setCountdownMs(0);
        setCountdownRunning(false);
        countdownEndRef.current = null;
        return;
      }
      setCountdownMs(remaining);
    }, 120);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    };
  }, [countdownRunning, countdownMs]);

  const handleStopwatchStart = () => {
    setStopwatchRunning(true);
  };

  const handleStopwatchPause = () => {
    setStopwatchRunning(false);
  };

  const handleStopwatchReset = () => {
    setStopwatchRunning(false);
    setStopwatchMs(0);
    setLaps([]);
    lapIdRef.current = 1;
    stopwatchStartRef.current = null;
  };

  const handleStopwatchLap = () => {
    const lapId = `lap-${lapIdRef.current}`;
    lapIdRef.current += 1;
    setLaps((prev) => [{ id: lapId, value: stopwatchMs }, ...prev]);
  };

  const handleCountdownPreset = (minutes: number) => {
    setHoursInput('');
    setMinutesInput(String(minutes).padStart(2, '0'));
    setSecondsInput('00');
    setCountdownError('');
  };

  const handleCountdownStart = () => {
    if (countdownMs > 0 && !countdownRunning) {
      setCountdownError('');
      setCountdownRunning(true);
      return;
    }

    const totalSeconds = toSeconds(hoursInput, minutesInput, secondsInput);
    if (totalSeconds <= 0) {
      setCountdownError(t('countdown.error'));
      return;
    }
    setCountdownError('');
    setCountdownMs(totalSeconds * 1000);
    countdownEndRef.current = null;
    setCountdownRunning(true);
  };

  const handleCountdownPause = () => {
    setCountdownRunning(false);
  };

  const handleCountdownReset = () => {
    setCountdownRunning(false);
    setCountdownMs(0);
    countdownEndRef.current = null;
  };

  const handleCountdownClear = () => {
    setHoursInput('');
    setMinutesInput('00');
    setSecondsInput('00');
    handleCountdownReset();
    setCountdownError('');
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyMessage(t('common.copied'));
    } catch {
      setCopyMessage(t('common.copyFailed'));
    }
  };

  const stopwatchDisplay = useMemo(() => formatDuration(stopwatchMs), [stopwatchMs]);
  const countdownDisplay = useMemo(() => formatDuration(countdownMs, false), [countdownMs]);

  const countdownReady = countdownMs > 0 || toSeconds(hoursInput, minutesInput, secondsInput) > 0;

  const modeButtonClass = (current: Mode) =>
    cn(
      'flex-1 rounded-md border px-3 py-2 text-sm font-semibold transition-colors',
      current === mode
        ? 'border-point-2 bg-point-2 text-white'
        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200',
    );

  return (
    <section className="space-y-6">
      <div className="flex gap-2">
        <button
          type="button"
          className={modeButtonClass('stopwatch')}
          onClick={() => setMode('stopwatch')}
        >
          {t('tabs.stopwatch')}
        </button>
        <button
          type="button"
          className={modeButtonClass('countdown')}
          onClick={() => setMode('countdown')}
        >
          {t('tabs.countdown')}
        </button>
      </div>

      {mode === 'stopwatch' ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <div className="space-y-1">
            <H2>{t('stopwatch.title')}</H2>
            <Text color="basic-4">{t('stopwatch.description')}</Text>
          </div>

          <div className="rounded-lg bg-gray-50 dark:bg-gray-900 px-4 py-6 text-center space-y-2">
            <Text variant="t1" className="tracking-widest">
              {stopwatchDisplay}
            </Text>
            <Text color="basic-5">{t('stopwatch.hint')}</Text>
          </div>

          <div className="flex flex-wrap gap-2">
            {!stopwatchRunning ? (
              <Button type="button" onClick={handleStopwatchStart}>
                {stopwatchMs === 0 ? t('stopwatch.start') : t('stopwatch.resume')}
              </Button>
            ) : (
              <Button type="button" onClick={handleStopwatchPause}>
                {t('stopwatch.pause')}
              </Button>
            )}
            <Button type="button" onClick={handleStopwatchLap} disabled={stopwatchMs === 0}>
              {t('stopwatch.lap')}
            </Button>
            <Button type="button" onClick={handleStopwatchReset} disabled={stopwatchMs === 0}>
              {t('stopwatch.reset')}
            </Button>
            <Button
              type="button"
              onClick={() => handleCopy(stopwatchDisplay)}
              disabled={stopwatchMs === 0}
            >
              {t('common.copy')}
            </Button>
          </div>

          {copyMessage && (
            <Text color="basic-4" className="text-sm">
              {copyMessage}
            </Text>
          )}

          <div className="space-y-2">
            <H3>{t('stopwatch.laps')}</H3>
            {laps.length === 0 ? (
              <Text color="basic-5">{t('stopwatch.emptyLaps')}</Text>
            ) : (
              <ul className="space-y-2">
                {laps.map((lap, index) => (
                  <li
                    key={lap.id}
                    className="flex items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2"
                  >
                    <Text color="basic-4">
                      {t('stopwatch.lapNumber', { number: laps.length - index })}
                    </Text>
                    <Text>{formatDuration(lap.value)}</Text>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <div className="space-y-1">
            <H2>{t('countdown.title')}</H2>
            <Text color="basic-4">{t('countdown.description')}</Text>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Text color="basic-5">{t('inputs.hours')}</Text>
              <Input
                value={hoursInput}
                onChange={(event) => setHoursInput(sanitizeNumberInput(event.target.value, 2))}
                placeholder="00"
                inputMode="numeric"
              />
            </div>
            <div className="space-y-1">
              <Text color="basic-5">{t('inputs.minutes')}</Text>
              <Input
                value={minutesInput}
                onChange={(event) => setMinutesInput(sanitizeNumberInput(event.target.value, 2))}
                placeholder="00"
                inputMode="numeric"
              />
            </div>
            <div className="space-y-1">
              <Text color="basic-5">{t('inputs.seconds')}</Text>
              <Input
                value={secondsInput}
                onChange={(event) => setSecondsInput(sanitizeNumberInput(event.target.value, 2))}
                placeholder="00"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[5, 10, 25].map((minutes) => (
              <button
                key={minutes}
                type="button"
                className="rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs"
                onClick={() => handleCountdownPreset(minutes)}
              >
                {t('countdown.preset', { minutes })}
              </button>
            ))}
          </div>

          <div className="rounded-lg bg-gray-50 dark:bg-gray-900 px-4 py-6 text-center space-y-2">
            <Text variant="t1" className="tracking-widest">
              {countdownDisplay}
            </Text>
            <Text color="basic-5">{t('countdown.hint')}</Text>
          </div>

          <div className="flex flex-wrap gap-2">
            {!countdownRunning ? (
              <Button type="button" onClick={handleCountdownStart} disabled={!countdownReady}>
                {countdownMs === 0 ? t('countdown.start') : t('countdown.resume')}
              </Button>
            ) : (
              <Button type="button" onClick={handleCountdownPause}>
                {t('countdown.pause')}
              </Button>
            )}
            <Button type="button" onClick={handleCountdownReset} disabled={countdownMs === 0}>
              {t('countdown.reset')}
            </Button>
            <Button type="button" onClick={handleCountdownClear}>
              {t('countdown.clear')}
            </Button>
            <Button
              type="button"
              onClick={() => handleCopy(countdownDisplay)}
              disabled={countdownMs === 0}
            >
              {t('common.copy')}
            </Button>
          </div>

          {countdownError && (
            <Text color="basic-4" className="text-sm">
              {countdownError}
            </Text>
          )}
          {copyMessage && (
            <Text color="basic-4" className="text-sm">
              {copyMessage}
            </Text>
          )}
        </div>
      )}

      <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-4 space-y-1">
        <H3>{t('tips.title')}</H3>
        <Text color="basic-5">{t('tips.body')}</Text>
      </div>
    </section>
  );
}
