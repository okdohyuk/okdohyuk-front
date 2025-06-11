'use client';

import { AnimatePresence, motion, TargetAndTransition } from 'framer-motion';
import { format } from 'date-fns';
import React from 'react';
import { TFunction } from 'i18next';

export interface TimeDisplayProps {
  isLoading: boolean;
  error: string | null;
  serverTime: Date | null;
  selectedSite: string;
  customServerUrl: string;
  getHostname: (url: string) => string;
  urgentStyle: TargetAndTransition;
  showMilliseconds: boolean;
  t: TFunction<'server-clock', undefined>;
}

export default function TimeDisplay({
  isLoading,
  error,
  serverTime,
  selectedSite,
  customServerUrl,
  getHostname,
  urgentStyle,
  showMilliseconds,
  t,
}: TimeDisplayProps) {
  return (
    <div className="mx-auto inline-block min-w-[320px] rounded-2xl bg-gray-50 p-6 shadow-xl transition-all duration-300 dark:bg-gray-800 md:min-w-[500px] md:p-10">
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.p
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-[120px] items-center justify-center text-2xl"
          >
            {t('loading')}
          </motion.p>
        )}
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-[120px] items-center justify-center text-xl text-red-500 dark:text-red-400"
          >
            {error}
          </motion.p>
        )}
        {serverTime && !isLoading && (
          <motion.div
            key="time-display"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex h-[120px] flex-col justify-center"
          >
            <p
              className="mb-2 truncate text-xl text-gray-600 dark:text-gray-300 md:text-2xl"
              title={selectedSite === 'custom' ? customServerUrl : selectedSite}
            >
              <span className="font-semibold capitalize">
                {selectedSite === 'custom'
                  ? customServerUrl
                    ? getHostname(customServerUrl)
                    : t('customServer') // 'custom' 대신 'customServer' 번역 키 사용
                  : selectedSite}
              </span>
            </p>
            <p className="font-mono tabular-nums text-6xl tracking-tighter text-gray-900 dark:text-white md:text-7xl">
              <motion.span
                className="inline-block"
                animate={urgentStyle}
                transition={{ duration: 0.1, ease: 'linear' }}
              >
                {format(serverTime, 'HH:mm:ss')}
              </motion.span>
              <AnimatePresence>
                {showMilliseconds && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="inline-block min-w-[4.5rem] overflow-hidden align-bottom text-4xl text-blue-500 dark:text-blue-400 md:min-w-[6rem] md:text-5xl"
                  >
                    .{format(serverTime, 'SSS')}
                  </motion.span>
                )}
              </AnimatePresence>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
