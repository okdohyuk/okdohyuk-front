'use client';

import React, { useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { sendGAEvent } from '@libs/client/gtag';
import { motion } from 'framer-motion';

const LANGUAGES = [
  { code: 'ko', name: '한국어' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
];

function LocalesNav() {
  const pathname = usePathname();
  const router = useRouter();

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
      router.push(newPathname);
    },
    [pathname, router],
  );

  if (!pathname) return null;

  return (
    <motion.div
      className={
        'fixed z-30 bottom-[77px] right-5 lg:bottom-[340px] lg:right-5 lg:left-auto rounded-full shadow-md overflow-hidden'
      }
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <select
        value={currentLang}
        onChange={handleLanguageChange}
        className={
          'h-[57px] w-20 px-4 appearance-none bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm font-medium rounded-full border-0 focus:outline-none cursor-pointer transition-colors text-center'
        }
        aria-label="Select language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </motion.div>
  );
}

export default LocalesNav;
