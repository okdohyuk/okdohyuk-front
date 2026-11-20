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
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-ring ${
            selectedSite === site
              ? 'border-point-2 bg-point-2 text-white'
              : 'border-basic-3 bg-basic-0 text-fg-3 hover:bg-basic-2'
          } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 4 },
          }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
        >
          {site.charAt(0).toUpperCase() + site.slice(1)}
        </motion.button>
      ))}
      <motion.button
        key="custom"
        onClick={() => handleSiteSelection('custom')}
        disabled={isLoading}
        className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-ring ${
          selectedSite === 'custom'
            ? 'border-point-2 bg-point-2 text-white'
            : 'border-basic-3 bg-basic-0 text-fg-3 hover:bg-basic-2'
        } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
        variants={{
          visible: { opacity: 1, y: 0 },
          hidden: { opacity: 0, y: 4 },
        }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
      >
        {t('customServer')}
      </motion.button>
    </motion.div>
  );
}
