'use client';

import { motion } from 'framer-motion';
import React from 'react';
import { TFunction } from 'i18next';

interface CustomUrlInputProps {
  inputCustomUrl: string;
  setInputCustomUrl: (url: string) => void;
  isLoading: boolean;
  handleCustomUrlFetch: () => void;
  t: TFunction<'server-clock', undefined>;
}

export default function CustomUrlInput({
  inputCustomUrl,
  setInputCustomUrl,
  isLoading,
  handleCustomUrlFetch,
  t,
}: CustomUrlInputProps) {
  return (
    <motion.div
      className="mb-8 flex flex-col items-center gap-2 md:flex-row md:justify-center"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`flex items-center rounded-lg border bg-basic-0 ${
          isLoading ? 'cursor-not-allowed opacity-50' : ''
        } border-basic-3 focus-within:border-info-2 focus-within:ring-1 focus-within:ring-info-2`}
      >
        <span className="pl-3 text-fg-5">https://</span>
        <input
          type="text"
          value={inputCustomUrl}
          onChange={(e) => setInputCustomUrl(e.target.value.replace(/^https?:\/\//, ''))}
          placeholder={t('enterCustomUrlPlaceholder')}
          disabled={isLoading}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleCustomUrlFetch()}
          className="input-text w-full bg-transparent p-2 pr-3 focus:outline-none text-fg-1 border-none"
        />
      </div>
      <motion.button
        onClick={handleCustomUrlFetch}
        disabled={isLoading || !inputCustomUrl}
        className={`h-[44px] rounded-lg bg-success-2 px-4 py-2 font-semibold text-white transition-colors hover:bg-success-1 focus:outline-none focus:ring-2 focus:ring-success-2 focus:ring-offset-2 ${
          isLoading || !inputCustomUrl ? 'cursor-not-allowed opacity-50' : ''
        }`}
        whileHover={{ scale: isLoading || !inputCustomUrl ? 1 : 1.05 }}
        whileTap={{ scale: isLoading || !inputCustomUrl ? 1 : 0.95 }}
      >
        {t('fetchTime')}
      </motion.button>
    </motion.div>
  );
}
