'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { FileText, Home, Menu, type LucideIcon } from 'lucide-react';
import Link from '@components/basic/Link';
import { cn } from '@utils/cn';
import { stringToLanguage } from '@utils/localeUtil';
import { sendGAEvent } from '@libs/client/gtag';
import { fallbackLng } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';

type NavItem = {
  /** Stable English key — used for GA so events don't split by locale. */
  key: 'Home' | 'Blog' | 'Menu';
  labelKey: 'navigation.home' | 'navigation.blog' | 'navigation.menu';
  icon: LucideIcon;
  link: string;
  pathname: string;
};

const navList: NavItem[] = [
  { key: 'Home', labelKey: 'navigation.home', icon: Home, link: '/', pathname: '/' },
  { key: 'Blog', labelKey: 'navigation.blog', icon: FileText, link: '/blog', pathname: '/blog' },
  { key: 'Menu', labelKey: 'navigation.menu', icon: Menu, link: '/menu', pathname: '/menu' },
];

/*
 * Floating app nav. Mobile: bottom bar with labels. Desktop (lg): icon column, rendered static
 * inside the fixed dock in CommonLayout (stacked under the language select).
 * Quiet chrome: neutral surface + hairline, small neutral shadow, active = surface step.
 */
function Nav() {
  const pathname = usePathname();

  const { language, normalizedPath } = useMemo(() => {
    const path = pathname ?? '/';
    const localeSegment = path.split('/')[1] ?? fallbackLng;
    const withoutLocale = path.replace(/^\/[a-z]{2}(?=\/|$)/, '');
    return {
      language: stringToLanguage(localeSegment) ?? fallbackLng,
      normalizedPath: withoutLocale || '/',
    };
  }, [pathname]);

  const { t } = useTranslation(language, 'common');

  return (
    <nav
      aria-label={t('navigation.mainNav')}
      className={cn(
        'fixed bottom-[max(8px,env(safe-area-inset-bottom))] left-1/2 z-30 w-[calc(100%-16px)] max-w-md -translate-x-1/2',
        'rounded-2xl border border-basic-3 bg-basic-0 p-1 shadow-md dark:bg-basic-1',
        'lg:static lg:w-auto lg:max-w-none lg:translate-x-0',
      )}
    >
      <ul className="grid grid-cols-3 gap-1 lg:grid-cols-1">
        {navList.map((navItem) => {
          const Icon = navItem.icon;
          const label = t(navItem.labelKey);
          const isActive =
            navItem.pathname === '/'
              ? normalizedPath === '/'
              : normalizedPath.startsWith(navItem.pathname);

          return (
            <li key={navItem.key} className="min-w-0">
              <Link
                href={navItem.link}
                onClick={() =>
                  sendGAEvent('nav_click', navItem.key, {
                    nav_item: navItem.key,
                    nav_position: 'bottom',
                  })
                }
                prefetch
                aria-current={isActive ? 'page' : undefined}
                title={label}
                className={cn(
                  'flex h-12 w-full flex-col items-center justify-center gap-1 rounded-xl border text-center transition-colors duration-150',
                  'focus-ring',
                  'lg:w-12',
                  isActive
                    ? 'border-basic-3 bg-basic-2 text-fg-1'
                    : 'border-transparent text-fg-5 hover:bg-basic-2 hover:text-fg-2',
                )}
              >
                <Icon size={18} strokeWidth={1.75} aria-hidden />
                <span className="text-2xs font-medium leading-none lg:sr-only">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default Nav;
