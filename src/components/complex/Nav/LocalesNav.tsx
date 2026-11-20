'use client';

import React, { useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { sendGAEvent } from '@libs/client/gtag';
import { Languages } from 'lucide-react';
import { stringToLanguage } from '@utils/localeUtil';
import { cn } from '@utils/cn';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { fallbackLng } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';

const LANGUAGES = [
  { code: 'ko', name: '한국어' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
];

/*
 * Language select. Mobile: floats bottom-right just above the bottom nav (nav = 58px + 8px
 * offset, plus 8px gap). Desktop (lg): rendered static at the top of the fixed dock in
 * CommonLayout, so it stacks on the nav without a magic offset.
 * The trigger sizes to its content so "한국어" / "English" never truncate.
 */
function LocalesNav() {
  const pathname = usePathname();

  const currentLang = useMemo(() => {
    if (!pathname) return 'ko';
    const match = pathname.match(/^\/([^/]+)/);
    return match ? match[1] : 'ko';
  }, [pathname]);

  const { t } = useTranslation(stringToLanguage(currentLang) ?? fallbackLng, 'common');

  const handleLanguageChange = useCallback(
    (newLang: string) => {
      if (!pathname) return;
      const newPathname = pathname.replace(/^\/([^/]+)/, `/${newLang}`);
      sendGAEvent('language_change', newLang, {
        from_lng: currentLang,
        to_lng: newLang,
      });
      window.location.href = `${newPathname}${window.location.search}${window.location.hash}`;
    },
    [pathname, currentLang],
  );

  if (!pathname) return null;

  return (
    <div className={cn('fixed bottom-[var(--mobile-nav-clearance)] right-2 z-30', 'lg:static')}>
      <Select value={currentLang} onValueChange={handleLanguageChange}>
        <SelectTrigger
          className="h-9 w-auto gap-2 whitespace-nowrap rounded-xl border-basic-3 bg-basic-0 px-3 text-xs font-medium text-fg-2 shadow-md dark:bg-basic-1 [&>span]:line-clamp-none"
          aria-label={t('navigation.selectLanguage')}
        >
          <Languages size={16} strokeWidth={1.75} className="shrink-0 text-fg-5" aria-hidden />
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code} lang={lang.code} className="text-xs">
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default LocalesNav;
