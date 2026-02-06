'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bomb, RotateCcw, Settings2, Zap } from 'lucide-react';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

const MAX_ALLOWED_NUMBER = 200;
const MAX_BALLS_DISPLAY = 100;
const TAIL_BALLS_DISPLAY = 5;
const DRAW_ANIMATION_STEPS = 6;
const DRAW_INTERVAL_MS = 180;

export default function PpollongPage({ params }: LanguageParams) {
  const { lng } = React.use(params);
  const language = lng as Language;
  const { t } = useTranslation(language, 'ppollong');
  const shouldReduceMotion = useReducedMotion();

  const [maxNumber, setMaxNumber] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>('45');
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const drawIntervalRef = useRef<number | null>(null);

  const drawnSet = useMemo(() => new Set(drawnNumbers), [drawnNumbers]);

  const availableNumbers = useMemo(() => {
    if (!isInitialized || maxNumber === 0) return [];
    return Array.from({ length: maxNumber }, (_, index) => index + 1).filter(
      (number) => !drawnSet.has(number),
    );
  }, [drawnSet, isInitialized, maxNumber]);

  const clearDrawInterval = useCallback(() => {
    if (drawIntervalRef.current !== null) {
      window.clearInterval(drawIntervalRef.current);
      drawIntervalRef.current = null;
    }
  }, []);

  useEffect(() => () => clearDrawInterval(), [clearDrawInterval]);

  const handleInitialize = useCallback(() => {
    const num = parseInt(inputValue, 10);

    if (Number.isNaN(num) || num <= 0) {
      setError(t('error.invalidNumber'));
      setIsInitialized(false);
      return;
    }

    if (num > MAX_ALLOWED_NUMBER) {
      setError(t('error.maxNumberExceeded'));
      setIsInitialized(false);
      return;
    }

    clearDrawInterval();
    setMaxNumber(num);
    setDrawnNumbers([]);
    setCurrentNumber(null);
    setError(null);
    setIsLoading(false);
    setIsInitialized(true);
  }, [clearDrawInterval, inputValue, t]);

  const handleDraw = useCallback(() => {
    const numbersToDrawFrom = availableNumbers;

    if (numbersToDrawFrom.length === 0) {
      setError(isInitialized ? t('error.allDrawnMessage') : t('error.notInitialized'));
      return;
    }

    setError(null);
    clearDrawInterval();
    setIsLoading(true);
    setCurrentNumber(null);

    let currentStep = 0;
    drawIntervalRef.current = window.setInterval(() => {
      const randomIndex = Math.floor(Math.random() * numbersToDrawFrom.length);
      setCurrentNumber(numbersToDrawFrom[randomIndex]);
      currentStep += 1;

      if (currentStep >= DRAW_ANIMATION_STEPS) {
        clearDrawInterval();
        const finalRandomIndex = Math.floor(Math.random() * numbersToDrawFrom.length);
        const drawn = numbersToDrawFrom[finalRandomIndex];

        setCurrentNumber(drawn);
        setDrawnNumbers((prev) => [...prev, drawn].sort((a, b) => a - b));
        setIsLoading(false);
      }
    }, DRAW_INTERVAL_MS);
  }, [availableNumbers, clearDrawInterval, isInitialized, t]);

  const handleReset = useCallback(() => {
    clearDrawInterval();
    setIsInitialized(false);
    setMaxNumber(0);
    setDrawnNumbers([]);
    setCurrentNumber(null);
    setError(null);
    setIsLoading(false);
  }, [clearDrawInterval]);

  const displayedNumbers = useMemo(() => {
    if (maxNumber <= MAX_BALLS_DISPLAY + TAIL_BALLS_DISPLAY) {
      return {
        head: Array.from({ length: maxNumber }, (_, index) => index + 1),
        tail: [] as number[],
      };
    }

    return {
      head: Array.from({ length: MAX_BALLS_DISPLAY }, (_, index) => index + 1),
      tail: Array.from({ length: TAIL_BALLS_DISPLAY }, (_, index) => maxNumber - 4 + index),
    };
  }, [maxNumber]);

  const drawButtonLabel = useMemo(() => {
    if (isLoading) return t('drawButton.loading');
    if (availableNumbers.length === 0) return t('drawButton.allDrawn');
    return t('drawButton.ready');
  }, [availableNumbers.length, isLoading, t]);

  return (
    <div className="space-y-4">
      <ServicePageHeader title={t('title')} description={t('openGraph.description')} />

      <motion.section
        className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
      >
        <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-800 dark:text-zinc-100">
          <Settings2 className="h-4 w-4 text-point-1" />
          {t('settingsTitle')}
        </h2>

        <div className="flex gap-2">
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('maxNumberPlaceholder')}
            className="w-full"
            disabled={isInitialized || isLoading}
          />

          {!isInitialized ? (
            <motion.button
              type="button"
              className={cn(
                SERVICE_CARD_INTERACTIVE,
                'h-10 shrink-0 whitespace-nowrap rounded-xl bg-point-1 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60',
              )}
              disabled={isLoading}
              onClick={handleInitialize}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            >
              {t('initializeButton')}
            </motion.button>
          ) : (
            <motion.button
              type="button"
              className={cn(
                SERVICE_CARD_INTERACTIVE,
                'flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white/80 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200',
              )}
              title={t('resetButtonTitle')}
              onClick={handleReset}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
            >
              <RotateCcw className="h-4 w-4" />
            </motion.button>
          )}
        </div>

        {error && !isLoading && (
          <p className="animate-pulse text-sm font-medium text-red-500 dark:text-red-400">
            {error}
          </p>
        )}
      </motion.section>

      {isInitialized && (
        <motion.section
          className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-5 p-4')}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
        >
          <div className="text-center">
            <motion.div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-point-1/20 to-violet-500/20 text-point-1"
              animate={
                isLoading ? { rotate: [0, -8, 8, -8, 0], scale: [1, 1.08, 1, 1.08, 1] } : undefined
              }
              transition={
                isLoading
                  ? {
                      duration: shouldReduceMotion ? 0 : 0.35,
                      repeat: Infinity,
                      repeatType: 'loop',
                    }
                  : { duration: 0 }
              }
            >
              <Bomb className="h-7 w-7" />
            </motion.div>

            <motion.button
              type="button"
              className={cn(
                SERVICE_CARD_INTERACTIVE,
                'flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-point-1 to-violet-500 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(0,0,0,0.14)] disabled:cursor-not-allowed disabled:opacity-55',
              )}
              onClick={handleDraw}
              disabled={isLoading || availableNumbers.length === 0}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            >
              <Zap className="h-4 w-4" />
              {drawButtonLabel}
            </motion.button>
          </div>

          <AnimatePresence>
            {currentNumber !== null && (
              <motion.div
                className="rounded-2xl border border-yellow-300/70 bg-yellow-100/75 p-6 text-center shadow-inner dark:border-yellow-700/50 dark:bg-yellow-900/25"
                initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 12, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 180, damping: 12 }}
              >
                <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
                  {t('drawnNumberPrefix')}
                </p>
                <span className="mt-2 block bg-gradient-to-br from-yellow-500 to-red-600 bg-clip-text text-6xl font-black text-transparent md:text-7xl">
                  {currentNumber}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      )}

      {isInitialized && maxNumber > 0 && (
        <motion.section
          className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
        >
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            {t('numberBoardTitle', {
              maxNumber,
              drawnCount: drawnNumbers.length,
              totalCount: maxNumber,
            })}
          </h3>

          <div
            className="flex flex-wrap justify-center gap-2"
            style={{ contentVisibility: 'auto' }}
          >
            {displayedNumbers.head.map((number) => {
              const isDrawn = drawnSet.has(number);
              return (
                <div
                  key={number}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition-all md:h-10 md:w-10 md:text-sm',
                    isDrawn
                      ? 'border-zinc-400 bg-zinc-200 text-zinc-500 opacity-60 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                      : 'border-point-2/70 bg-point-2/25 text-point-1 dark:border-point-2/60 dark:bg-point-1/20 dark:text-point-2',
                    currentNumber === number && isLoading
                      ? 'scale-110 animate-pulse shadow-md'
                      : '',
                  )}
                >
                  {number}
                </div>
              );
            })}

            {displayedNumbers.tail.length > 0 ? (
              <div className="flex items-center px-1 text-sm font-bold text-zinc-500 dark:text-zinc-400">
                ...
              </div>
            ) : null}

            {displayedNumbers.tail.map((number) => {
              const isDrawn = drawnSet.has(number);
              return (
                <div
                  key={number}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition-all md:h-10 md:w-10 md:text-sm',
                    isDrawn
                      ? 'border-zinc-400 bg-zinc-200 text-zinc-500 opacity-60 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                      : 'border-point-2/70 bg-point-2/25 text-point-1 dark:border-point-2/60 dark:bg-point-1/20 dark:text-point-2',
                  )}
                >
                  {number}
                </div>
              );
            })}
          </div>
        </motion.section>
      )}
    </div>
  );
}
