'use client';

import React, { useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { sendGAEvent } from '@libs/client/gtag';
import { Languages } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';

const LANGUAGES = [
  { code: 'ko', name: '한국어' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
];

function LocalesNav() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const currentLang = useMemo(() => {
    if (!pathname) return 'ko';
    const match = pathname.match(/^\/([^/]+)/);
    return match ? match[1] : 'ko';
  }, [pathname]);

  const handleLanguageChange = useCallback(
    (newLang: string) => {
      if (!pathname) return;
      const newPathname = pathname.replace(/^\/([^/]+)/, `/${newLang}`);
      sendGAEvent('link_click', `change_language_to_${newLang}`);
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
      <Select value={currentLang} onValueChange={handleLanguageChange}>
        <SelectTrigger
          className="h-12 w-24 gap-1.5 rounded-2xl border-basic-3/80 bg-basic-0/80 px-3 text-xs font-semibold text-fg-2 shadow-[0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl focus:ring-point-1/50"
          aria-label="Select language"
        >
          <Languages className="h-4 w-4 shrink-0 text-fg-5" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code} className="text-xs">
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  );
}

export default LocalesNav;
