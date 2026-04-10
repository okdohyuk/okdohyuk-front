'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import Cookies from 'js-cookie';
import { menus } from '@assets/datas/menus';
import { Input } from '@components/basic/Input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { cn } from '@utils/cn';
import { loadSitemapRoutes } from '@utils/sitemapSearch';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

type GlobalSearchPaletteProps = {
  lng: Language;
};

type SearchRoute = {
  href: string;
  title: string;
  subtitle: string;
};

const getPathWithoutLocale = (path: string) => {
  const segments = path.split('/').filter(Boolean);
  return `/${segments.slice(1).join('/')}`.replace(/\/$/, '') || '/';
};

const formatPathAsTitle = (path: string) =>
  getPathWithoutLocale(path)
    .split('/')
    .filter(Boolean)
    .pop()
    ?.replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (value) => value.toUpperCase()) || 'Home';

const getRoleFromCookie = () => {
  try {
    const userInfo = Cookies.get('user_info');
    if (!userInfo) return 'GUEST';
    const parsed = JSON.parse(userInfo) as { role?: string };
    return parsed.role || 'GUEST';
  } catch {
    return 'GUEST';
  }
};

const canAccessRoute = (path: string, role: string) => {
  if (path.includes('/auth')) return false;
  if (path.includes('/admin')) return role === 'ADMIN';
  return true;
};

const LOCALIZED_MENU_MAP = menus.service.reduce<Record<string, Record<Language, string>>>(
  (acc, menu) => {
    acc[menu.link] = menu.title;
    return acc;
  },
  {},
);

export default function GlobalSearchPalette({ lng }: GlobalSearchPaletteProps) {
  const pathname = usePathname();
  const { t } = useTranslation(lng, 'menu');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [routes, setRoutes] = useState<SearchRoute[]>([]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  const hydrateRoutes = useCallback(async () => {
    const role = getRoleFromCookie();
    const sitemapRoutes = await loadSitemapRoutes();

    const deduplicated = Array.from(
      new Set(sitemapRoutes.filter((item) => item.locale === lng).map((item) => item.path)),
    );

    const nextRoutes = deduplicated
      .filter((path) => canAccessRoute(path, role))
      .map((path) => {
        const relativePath = getPathWithoutLocale(path);
        const localizedTitle = LOCALIZED_MENU_MAP[relativePath]?.[lng];

        return {
          href: path,
          title: localizedTitle || formatPathAsTitle(path),
          subtitle: relativePath,
        };
      });

    setRoutes(nextRoutes);
  }, [lng]);

  useEffect(() => {
    if (open) {
      hydrateRoutes();
    }
  }, [hydrateRoutes, open]);

  const filteredRoutes = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return routes;

    return routes.filter(
      (route) =>
        route.title.toLowerCase().includes(keyword) ||
        route.subtitle.toLowerCase().includes(keyword),
    );
  }, [query, routes]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[75vh] max-w-2xl overflow-hidden border-zinc-200 bg-white/95 p-0 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>{t('palette.title')}</DialogTitle>
          <DialogDescription>{t('palette.description')}</DialogDescription>
        </DialogHeader>
        <div className="px-5 pb-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('palette.placeholder')}
              className="h-11 rounded-xl pl-10"
            />
          </div>
          <p className="mt-2 text-xs text-zinc-500">{t('palette.shortcut')}</p>
        </div>
        <div className="max-h-[48vh] overflow-y-auto border-t border-zinc-200 dark:border-zinc-700">
          {filteredRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-3 transition-colors hover:bg-zinc-100/70 dark:border-zinc-800 dark:hover:bg-zinc-800/60',
                pathname === route.href && 'bg-point-4/50 dark:bg-point-1/20',
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {route.title}
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {route.subtitle}
                </p>
              </div>
            </Link>
          ))}
          {filteredRoutes.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-zinc-500">{t('palette.empty')}</div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
