'use client';

import { motion } from 'framer-motion';
import React from 'react';
import { TFunction } from 'i18next';

interface DisplaySettingsProps {
  showMilliseconds: boolean;
  setShowMilliseconds: (show: boolean) => void;
  t: TFunction<'server-clock', undefined>;
}

export default function DisplaySettings({
  showMilliseconds,
  setShowMilliseconds,
  t,
}: DisplaySettingsProps) {
  return (
    <div className="mt-6 flex flex-col items-center gap-4">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="show-ms"
          checked={showMilliseconds}
          onChange={() => setShowMilliseconds(!showMilliseconds)}
          className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
        />
        <label
          htmlFor="show-ms"
          className="ml-2 cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-300"
        >
          {t('showMilliseconds')}
        </label>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="max-w-md text-xs text-gray-500 dark:text-gray-400"
      >
        {t('disclaimer')}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="max-w-md text-xs text-gray-500 dark:text-gray-400"
      >
        {t('disclaimer2')}
      </motion.p>
    </div>
  );
}
