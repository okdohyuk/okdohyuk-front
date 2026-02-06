'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { FileText, Home, Menu, type LucideIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from '@components/basic/Link';
import { cn } from '@utils/cn';
import { sendGAEvent } from '@libs/client/gtag';

type NavItem = {
  name: string;
  icon: LucideIcon;
  link: string;
  pathname: string;
};

const navList: NavItem[] = [
  {
    name: 'Home',
    icon: Home,
    link: '/',
    pathname: '/',
  },
  {
    name: 'Blog',
    icon: FileText,
    link: '/blog',
    pathname: '/blog',
  },
  {
    name: 'Menu',
    icon: Menu,
    link: '/menu',
    pathname: '/menu',
  },
];

function Nav() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const normalizedPath = useMemo(() => {
    if (!pathname) {
      return '/';
    }

    const withoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '');
    return withoutLocale || '/';
  }, [pathname]);

  return (
    <motion.nav
      className="fixed bottom-[max(8px,env(safe-area-inset-bottom))] left-1/2 z-30 w-[calc(100%-16px)] max-w-md -translate-x-1/2 rounded-3xl border border-zinc-200/80 bg-white/80 p-2 shadow-[0_16px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-zinc-700/80 dark:bg-zinc-900/80 lg:bottom-6 lg:left-auto lg:right-6 lg:w-[68px] lg:max-w-none lg:translate-x-0"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
    >
      <ul className="grid grid-cols-3 gap-1 lg:grid-cols-1">
        {navList.map((navItem) => {
          const Icon = navItem.icon;
          const isActive =
            navItem.pathname === '/'
              ? normalizedPath === '/'
              : normalizedPath.startsWith(navItem.pathname);

          return (
            <li key={navItem.name} className="min-w-0">
              <Link
                href={navItem.link}
                onClick={() => sendGAEvent('link_click', navItem.name)}
                prefetch
                className={cn(
                  'group relative flex h-12 w-full flex-col items-center justify-center rounded-2xl text-center transition-colors lg:h-12',
                  isActive
                    ? 'text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200',
                )}
                aria-label={navItem.name}
              >
                <span
                  className={cn(
                    'absolute inset-0 rounded-2xl transition-opacity',
                    isActive
                      ? 'bg-point-2/35 opacity-100 dark:bg-point-1/20'
                      : 'bg-zinc-200/60 opacity-0 group-hover:opacity-100 dark:bg-zinc-700/60',
                  )}
                />
                <Icon className="relative z-10 h-5 w-5" />
                <span className="relative z-10 mt-1 text-[10px] font-semibold leading-none lg:hidden">
                  {navItem.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
}

export default Nav;
