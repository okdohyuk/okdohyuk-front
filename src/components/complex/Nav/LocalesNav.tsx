'use client';

import React, { useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { sendGAEvent } from '@libs/client/gtag';
import { ChevronDown, Languages } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const LANGUAGES = [
  { code: 'ko', name: '한국어' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
];

function LocalesNav() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  // Get current language from pathname
  const currentLang = useMemo(() => {
    if (!pathname) return 'ko';
    const match = pathname.match(/^\/([^/]+)/);
    return match ? match[1] : 'ko';
  }, [pathname]);

  // Handle language change
  const handleLanguageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newLang = e.target.value;
      if (!pathname) return;

      // Replace the language segment in the URL
      const newPathname = pathname.replace(/^\/([^/]+)/, `/${newLang}`);

      // Track the language change
      sendGAEvent('link_click', `change_language_to_${newLang}`);

      // Navigate to the new URL
      window.location.href = `${newPathname}${window.location.search}${window.location.hash}`;
    },
    [pathname],
  );

  if (!pathname) return null;

  return (
    <motion.div
      className="fixed bottom-[calc(80px+env(safe-area-inset-bottom))] right-4 z-30 lg:bottom-[calc(344px+env(safe-area-inset-bottom))] lg:right-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
    >
      <div className="relative h-12 w-24 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 shadow-[0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-zinc-700/80 dark:bg-zinc-900/80">
        <Languages className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" />
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" />
        <select
          value={currentLang}
          onChange={handleLanguageChange}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none border-0 bg-transparent pl-8 pr-7 text-xs font-semibold text-zinc-800 outline-none dark:text-zinc-200"
          aria-label="Select language"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    </motion.div>
  );
}

export default LocalesNav;
