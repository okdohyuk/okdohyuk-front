'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from '@components/basic/Link';
import { stringToLanguage } from '@utils/localeUtil';
import { cn } from '@utils/cn';
import { fallbackLng } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';

function BackToMenuNav() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const { language, normalizedPath } = useMemo(() => {
    const path = pathname ?? '/';
    const localeSegment = path.split('/')[1] ?? fallbackLng;
    const parsedLanguage = stringToLanguage(localeSegment) ?? fallbackLng;
    const withoutLocale = path.replace(/^\/[a-z]{2}(?=\/|$)/, '');

    return {
      language: parsedLanguage,
      normalizedPath: withoutLocale || '/',
    };
  }, [pathname]);

  const { t } = useTranslation(language, 'common');
  const isVisible = normalizedPath !== '/menu' && !normalizedPath.startsWith('/auth');

  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      className="mb-3"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
    >
      <Link
        href={`/${language}/menu`}
        prefetch
        className={cn(
          'group inline-flex h-10 items-center gap-2 rounded-2xl border border-basic-3/80 bg-basic-0/80 px-3 text-sm font-semibold text-fg-3 shadow-sm backdrop-blur-md transition-colors',
          'hover:border-point-2/70 hover:text-point-fg',
        )}
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        <span>{t('navigation.backToMenu')}</span>
      </Link>
    </motion.div>
  );
}

export default BackToMenuNav;
