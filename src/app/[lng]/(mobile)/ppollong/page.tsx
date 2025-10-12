'use client';

import React, { useCallback, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, Settings, Zap } from 'lucide-react';
import { LanguageParams } from '~/app/[lng]/layout';

const MAX_BALLS_DISPLAY = 100; // 화면에 표시할 최대 공 개수 (성능 고려)

export default function PpollongPage({ params }: LanguageParams) {
  const { lng } = React.use(params);
  const { t } = useTranslation(lng, 'ppollong'); // 'ppollong' 네임스페이스 사용
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
          className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base border-2
            ${
              isDrawn
                ? 'bg-gray-300 border-gray-400 text-gray-500 opacity-50'
                : 'bg-blue-100 border-blue-400 text-blue-700'
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
          <div key="ellipsis" className="p-2">
            ...
          </div>,
        );
        // 마지막 몇 개를 더 보여줄 수 있음
        for (let j = maxNumber - 4; j <= maxNumber; j += 1) {
          const isDrawnEnd = drawnNumbers.includes(j);
          balls.push(
            <motion.div
              key={j}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base border-2
                    ${
                      isDrawnEnd
                        ? 'bg-gray-300 border-gray-400 text-gray-500 opacity-50'
                        : 'bg-blue-100 border-blue-400 text-blue-700'
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
    <div className="container mx-auto p-4 flex flex-col items-center min-h-[calc(100vh-100px)]">
      <motion.h1
        className="text-3xl md:text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {t('title')}
      </motion.h1>

      {/* 설정 영역 */}
      <motion.div
        className="w-full max-w-md mb-8 p-6 bg-white shadow-xl rounded-xl border border-gray-200"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <Settings className="mr-2 text-blue-500" /> {t('settingsTitle')}
        </h2>
        <div className="flex space-x-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('maxNumberPlaceholder') || '최대 숫자 (예: 45)'}
            className="input-text w-full"
            disabled={isInitialized || isLoading}
          />
          {!isInitialized ? (
            <motion.button
              type="button"
              onClick={handleInitialize}
              className="button w-20 bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:bg-gray-300 text-nowrap"
              whileTap={{ scale: 0.97 }}
              disabled={isLoading}
            >
              {t('initializeButton')}
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={handleReset}
              className="button w-20 justify-center bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              whileTap={{ scale: 0.95 }}
              title={t('resetButtonTitle') || '설정 초기화'}
            >
              <RotateCcw size={20} />
            </motion.button>
          )}
        </div>
        {error && !isLoading && <p className="text-red-500 text-sm mt-2 animate-pulse">{error}</p>}
      </motion.div>

      {/* 뽑기 실행 영역 */}
      {isInitialized && (
        <motion.div
          className="w-full max-w-md mb-8 p-6 bg-white shadow-xl rounded-xl border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="text-center mb-6">
            {/* "대포" 시각적 요소 (간단하게) */}
            <motion.div
              className="text-6xl mb-4"
              animate={isLoading ? { rotate: [0, -5, 5, -5, 0], scale: [1, 1.1, 1, 1.1, 1] } : {}}
              transition={isLoading ? { duration: 0.3, repeat: Infinity, repeatType: 'loop' } : {}}
            >
              💣
            </motion.div>
            <motion.button
              type="button"
              onClick={handleDraw}
              className="button w-full px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xl font-bold rounded-full hover:from-green-500 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.98 }}
              disabled={isLoading || remainingNumbers.length === 0}
            >
              <Zap className="inline mr-2 mb-1" />
              {drawButtonLabel}
            </motion.button>
          </div>

          {/* 현재 뽑힌 숫자 */}
          <AnimatePresence>
            {currentNumber !== null && (
              <motion.div
                className="text-center my-6 p-6 bg-yellow-100 border-4 border-dashed border-yellow-400 rounded-xl shadow-inner"
                initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 15, transition: { duration: 0.3 } }}
                transition={{ type: 'spring', stiffness: 150, damping: 10 }}
              >
                <p className="text-sm text-yellow-600 font-semibold">{t('drawnNumberPrefix')}</p>
                <p className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-500 to-red-600 my-2">
                  {currentNumber}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* 뽑힌 숫자 목록 (구슬 모양) */}
      {isInitialized && maxNumber > 0 && (
        <motion.div
          className="w-full max-w-2xl mt-4 p-6 bg-gray-50 shadow-lg rounded-xl border border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-600">
            {t('numberBoardTitle', {
              maxNumber,
              drawnCount: drawnNumbers.length,
              totalCount: maxNumber,
            })}
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">{renderNumberBalls()}</div>
        </motion.div>
      )}
    </div>
  );
}
