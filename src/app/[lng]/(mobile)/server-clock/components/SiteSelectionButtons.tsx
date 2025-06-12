'use client';

import { motion } from 'framer-motion';
import React from 'react';
import { TFunction } from 'i18next'; // TFunction import 추가
import { TICKETING_SITES } from '../lib/constants';

interface SiteSelectionButtonsProps {
  selectedSite: string;
  isLoading: boolean;
  handleSiteSelection: (site: string) => void;
  t: TFunction<'server-clock', undefined>; // t 함수의 타입 수정
}

export default function SiteSelectionButtons({
  selectedSite,
  isLoading,
  handleSiteSelection,
  t,
}: SiteSelectionButtonsProps) {
  return (
    <motion.div
      className="mb-8 flex flex-wrap justify-center gap-2"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.05 } },
        hidden: {},
      }}
    >
      {TICKETING_SITES.filter((site) => site !== 'custom').map((site) => (
        <motion.button
          key={site}
          onClick={() => handleSiteSelection(site)}
          disabled={isLoading}
          className={`transform rounded-lg px-4 py-2 font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-black ${
            selectedSite === site
              ? 'scale-105 bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 20 },
          }}
          whileHover={{ y: isLoading ? 0 : -2 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
        >
          {site.charAt(0).toUpperCase() + site.slice(1)}
        </motion.button>
      ))}
      <motion.button
        key="custom"
        onClick={() => handleSiteSelection('custom')}
        disabled={isLoading}
        className={`transform rounded-lg px-4 py-2 font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-black ${
          selectedSite === 'custom'
            ? 'scale-105 bg-purple-600 text-white shadow-lg'
            : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
        } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
        variants={{
          visible: { opacity: 1, y: 0 },
          hidden: { opacity: 0, y: 20 },
        }}
        whileHover={{ y: isLoading ? 0 : -2 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
      >
        {t('customServer')}
      </motion.button>
    </motion.div>
  );
}
