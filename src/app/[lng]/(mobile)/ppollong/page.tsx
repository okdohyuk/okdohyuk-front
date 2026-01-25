'use client';

import React, { useCallback, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, Settings, Zap } from 'lucide-react';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { H1, H2, H3, Text } from '@components/basic/Text';

const MAX_BALLS_DISPLAY = 100; // 화면에 표시할 최대 공 개수 (성능 고려)

export default function PpollongPage({ params }: LanguageParams) {
  const { lng } = React.use(params);
  const language = lng as Language;
  const { t } = useTranslation(language, 'ppollong'); // 'ppollong' 네임스페이스 사용
  const [maxNumber, setMaxNumber] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>('45'); // 초기 입력값
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false); // 숫자가 설정되었는지 여부

  const availableNumbers = useCallback(() => {
    if (!isInitialized || maxNumber === 0) return [];
    const allNumbers = Array.from({ length: maxNumber }, (_, i) => i + 1);
    return allNumbers.filter((num) => !drawnNumbers.includes(num));
  }, [maxNumber, drawnNumbers, isInitialized]);

  const handleInitialize = () => {
    const num = parseInt(inputValue, 10);
    if (Number.isNaN(num) || num <= 0) {
      setError(t('error.invalidNumber'));
      setIsInitialized(false);
      return;
    }
    if (num > 200) {
      // 너무 많은 숫자 제한
      setError(t('error.maxNumberExceeded'));
      setIsInitialized(false);
      return;
    }
    setMaxNumber(num);
    setDrawnNumbers([]);
    setCurrentNumber(null);
    setError(null);
    setIsInitialized(true);
  };

  const handleDraw = () => {
    const numbersToDrawFrom = availableNumbers();
    if (numbersToDrawFrom.length === 0) {
      setError(isInitialized ? t('error.allDrawnMessage') : t('error.notInitialized'));
      return;
    }
    setError(null);
    setIsLoading(true);
    setCurrentNumber(null); // 이전 결과 숨기기

    // "뽈롱" 애니메이션 효과 (간단한 딜레이와 숫자 변경)
    const animationSteps = 5;
    let currentStep = 0;
    const intervalId = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * numbersToDrawFrom.length);
      setCurrentNumber(numbersToDrawFrom[randomIndex]); // 임시 숫자 보여주기
      currentStep += 1;
      if (currentStep >= animationSteps) {
        clearInterval(intervalId);
        const finalRandomIndex = Math.floor(Math.random() * numbersToDrawFrom.length);
        const drawn = numbersToDrawFrom[finalRandomIndex];
        setCurrentNumber(drawn);
        setDrawnNumbers((prev) => [...prev, drawn].sort((a, b) => a - b)); // 뽑은 숫자 추가 및 정렬
        setIsLoading(false);
      }
    }, 300); // 0.3초 간격으로 숫자 변경
  };

  const handleReset = () => {
    setIsInitialized(false);
    setMaxNumber(0);
    setDrawnNumbers([]);
    setCurrentNumber(null);
    setError(null);
    // inputValue는 유지하거나 초기화할 수 있음 (여기서는 유지)
  };

  // 전체 숫자 구슬들을 렌더링 (성능을 위해 일부만 표시)
  const renderNumberBalls = () => {
    if (!isInitialized) return null;
    const balls = [];
    for (let i = 1; i <= maxNumber; i += 1) {
      const isDrawn = drawnNumbers.includes(i);
      balls.push(
        <motion.div
          key={i}
          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold md:h-12 md:w-12 md:text-base
            ${
              isDrawn
                ? 'border-gray-400 bg-gray-300 text-gray-500 opacity-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                : 'border-blue-400 bg-blue-100 text-blue-700 dark:border-blue-500 dark:bg-blue-900/50 dark:text-blue-300'
            }
            ${currentNumber === i && isLoading ? 'animate-ping' : ''}
          `}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: (i - 1) * 0.02, duration: 0.3 }}
        >
          {i}
        </motion.div>,
      );
      if (i >= MAX_BALLS_DISPLAY && maxNumber > MAX_BALLS_DISPLAY + 5) {
        // 너무 많으면 ...으로 표시
        balls.push(
          <div key="ellipsis" className="p-2 t-basic-1">
            ...
          </div>,
        );
        // 마지막 몇 개를 더 보여줄 수 있음
        for (let j = maxNumber - 4; j <= maxNumber; j += 1) {
          const isDrawnEnd = drawnNumbers.includes(j);
          balls.push(
            <motion.div
              key={j}
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold md:h-12 md:w-12 md:text-base
                    ${
                      isDrawnEnd
                        ? 'border-gray-400 bg-gray-300 text-gray-500 opacity-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                        : 'border-blue-400 bg-blue-100 text-blue-700 dark:border-blue-500 dark:bg-blue-900/50 dark:text-blue-300'
                    }
                  `}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: (MAX_BALLS_DISPLAY + (j - (maxNumber - 4))) * 0.02,
                duration: 0.3,
              }}
            >
              {j}
            </motion.div>,
          );
        }
        break;
      }
    }
    return balls;
  };

  const remainingNumbers = availableNumbers();
  let drawButtonLabel = t('drawButton.ready');
  if (isLoading) {
    drawButtonLabel = t('drawButton.loading');
  } else if (remainingNumbers.length === 0) {
    drawButtonLabel = t('drawButton.allDrawn');
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-100px)] flex-col items-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <H1 className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-center text-3xl font-bold text-transparent md:text-4xl">
          {t('title')}
        </H1>
      </motion.div>

      {/* 설정 영역 */}
      <motion.div
        className="mb-8 w-full max-w-md rounded-xl bg-basic-3 p-6 shadow-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <H2 className="mb-4 flex items-center text-xl font-semibold t-basic-2">
          <Settings className="mr-2 text-blue-500" /> {t('settingsTitle')}
        </H2>
        <div className="flex space-x-2">
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('maxNumberPlaceholder') || '최대 숫자 (예: 45)'}
            className="w-full"
            disabled={isInitialized || isLoading}
          />
          {!isInitialized ? (
            <Button
              asChild
              className="w-20 text-nowrap bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-zinc-700"
              disabled={isLoading}
            >
              <motion.button type="button" onClick={handleInitialize} whileTap={{ scale: 0.97 }}>
                {t('initializeButton')}
              </motion.button>
            </Button>
          ) : (
            <Button
              asChild
              className="w-20 justify-center"
              title={t('resetButtonTitle') || '설정 초기화'}
            >
              <motion.button type="button" onClick={handleReset} whileTap={{ scale: 0.95 }}>
                <RotateCcw size={20} />
              </motion.button>
            </Button>
          )}
        </div>
        {error && !isLoading && (
          <Text variant="c1" className="mt-2 animate-pulse text-red-500">
            {error}
          </Text>
        )}
      </motion.div>

      {/* 뽑기 실행 영역 */}
      {isInitialized && (
        <motion.div
          className="mb-8 w-full max-w-md rounded-xl bg-basic-3 p-6 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="mb-6 text-center">
            {/* "대포" 시각적 요소 (간단하게) */}
            <motion.div
              className="mb-4 text-6xl"
              animate={isLoading ? { rotate: [0, -5, 5, -5, 0], scale: [1, 1.1, 1, 1.1, 1] } : {}}
              transition={isLoading ? { duration: 0.3, repeat: Infinity, repeatType: 'loop' } : {}}
            >
              💣
            </motion.div>
            <Button
              asChild
              className="h-auto w-full rounded-full bg-gradient-to-r from-green-400 to-blue-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all hover:scale-105 hover:from-green-500 hover:to-blue-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading || remainingNumbers.length === 0}
            >
              <motion.button type="button" onClick={handleDraw} whileTap={{ scale: 0.98 }}>
                <Zap className="mb-1 mr-2 inline" />
                {drawButtonLabel}
              </motion.button>
            </Button>
          </div>

          {/* 현재 뽑힌 숫자 */}
          <AnimatePresence>
            {currentNumber !== null && (
              <motion.div
                className="my-6 rounded-xl border-4 border-dashed border-yellow-400 bg-yellow-100 p-6 text-center shadow-inner dark:bg-yellow-900/30"
                initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 15, transition: { duration: 0.3 } }}
                transition={{ type: 'spring', stiffness: 150, damping: 10 }}
              >
                <Text className="font-semibold text-yellow-600 dark:text-yellow-400">
                  {t('drawnNumberPrefix')}
                </Text>
                <span className="my-2 bg-gradient-to-br from-yellow-500 to-red-600 bg-clip-text text-7xl font-black text-transparent md:text-8xl">
                  {currentNumber}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* 뽑힌 숫자 목록 (구슬 모양) */}
      {isInitialized && maxNumber > 0 && (
        <motion.div
          className="mt-4 w-full max-w-2xl rounded-xl bg-basic-4 p-6 shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <H3 className="mb-4 text-lg font-semibold t-basic-2">
            {t('numberBoardTitle', {
              maxNumber,
              drawnCount: drawnNumbers.length,
              totalCount: maxNumber,
            })}
          </H3>
          <div className="flex flex-wrap justify-center gap-2">{renderNumberBalls()}</div>
        </motion.div>
      )}
    </div>
  );
}
