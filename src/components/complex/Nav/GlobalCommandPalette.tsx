'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';
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
import { useTranslation } from '~/app/i18n/client';
import { Language, languages } from '~/app/i18n/settings';

type CommandPageItem = {
  path: string;
  subtitle: string;
  title: Record<Language, string>;
  requiredRole: 'ALL' | 'ADMIN';
};

const normalizePath = (pathname: string) => pathname.replace(/\/$/, '') || '/';

const parseRoleFromCookie = (): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookieValue = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('user_info='))
    ?.split('=')[1];

  if (!cookieValue) {
    return null;
  }

  try {
    const userInfo = JSON.parse(decodeURIComponent(cookieValue));
    return typeof userInfo?.role === 'string' ? userInfo.role.toUpperCase() : null;
  } catch {
    return null;
  }
};

const sanitizePathForSubtitle = (path: string) => {
  const withoutLocale = path.replace(/^\/(ko|en|ja|zh)(?=\/|$)/, '') || '/';
  return withoutLocale === '' ? '/' : withoutLocale;
};

const toLocalizedPath = (path: string, lng: Language) => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized === '/') {
    return `/${lng}`;
  }
  return `/${lng}${normalized}`;
};

const menuEntries: CommandPageItem[] = menus.service
  .filter((menu) => menu.link.startsWith('/'))
  .map((menu) => ({
    path: menu.link,
    subtitle: menu.link,
    title: menu.title,
    requiredRole: menu.link.startsWith('/admin') ? 'ADMIN' : 'ALL',
  }));

const parseSitemapLocs = (xmlText: string) => {
  const locRegex = /<loc>(.*?)<\/loc>/g;

  const paths = Array.from(xmlText.matchAll(locRegex))
    .map((matched) => matched[1]?.trim() || '')
    .filter(Boolean)
    .map((raw) => {
      try {
        const url = new URL(raw);
        return url.pathname ? normalizePath(url.pathname) : '';
      } catch {
        return raw.startsWith('/') ? normalizePath(raw) : '';
      }
    })
    .filter(Boolean);

  return Array.from(new Set(paths));
};

const buildSitemapItems = (paths: string[]): CommandPageItem[] =>
  paths
    .filter((path) => {
      const segments = path.split('/').filter(Boolean);
      const firstSegment = segments[0];

      if (!firstSegment || !languages.includes(firstSegment as Language)) {
        return false;
      }

      if (segments.some((segment) => segment.startsWith('['))) {
        return false;
      }

      return true;
    })
    .map((path) => {
      const subtitle = sanitizePathForSubtitle(path);
      const leaf = subtitle === '/' ? 'Home' : subtitle.split('/').filter(Boolean).at(-1) || 'Page';
      const fallbackTitle = leaf
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        path,
        subtitle,
        title: {
          ko: fallbackTitle,
          en: fallbackTitle,
          ja: fallbackTitle,
          zh: fallbackTitle,
        },
        requiredRole: path.includes('/admin') ? 'ADMIN' : 'ALL',
      };
    });

export default function GlobalCommandPalette() {
  const pathname = usePathname();
  const detectedLanguage = pathname.split('/')[1] as Language;
  const lng = languages.includes(detectedLanguage) ? detectedLanguage : 'ko';
  const { t } = useTranslation(lng, 'common');

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [sitemapItems, setSitemapItems] = useState<CommandPageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(parseRoleFromCookie());
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isK = event.key.toLowerCase() === 'k';
      const hasModifier = event.ctrlKey || event.metaKey;

      if (!isK || !hasModifier) {
        return;
      }

      event.preventDefault();
      setOpen((prev) => !prev);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open || sitemapItems.length > 0 || loading) {
      return;
    }

    const loadSitemap = async () => {
      setLoading(true);

      const targets = ['/sitemap.xml', '/server-sitemap.xml'];
      const xmlTexts = await Promise.all(
        targets.map(async (target) => {
          try {
            const response = await fetch(target);
            if (!response.ok) {
              return '';
            }
            return await response.text();
          } catch {
            return '';
          }
        }),
      );

      const paths = xmlTexts.flatMap(parseSitemapLocs);
      setSitemapItems(buildSitemapItems(paths));
      setLoading(false);
    };

    loadSitemap();
  }, [loading, open, sitemapItems.length]);

  const currentPath = normalizePath(pathname);

  const allItems = useMemo(() => {
    const sitemapByPath = new Map(sitemapItems.map((item) => [item.path, item]));

    menuEntries.forEach((menuEntry) => {
      const localizedPath = toLocalizedPath(menuEntry.path, lng);
      sitemapByPath.set(localizedPath, {
        ...menuEntry,
        path: localizedPath,
        subtitle: menuEntry.subtitle,
      });
    });

    return Array.from(sitemapByPath.values());
  }, [lng, sitemapItems]);

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return allItems
      .filter((item) => (item.requiredRole === 'ADMIN' ? role === 'ADMIN' : true))
      .filter((item) => item.path !== currentPath)
      .filter((item) => {
        if (!normalizedQuery) {
          return true;
        }

        const searchable = [
          item.title[lng],
          item.title.en,
          item.title.ja,
          item.title.zh,
          item.subtitle,
        ]
          .join(' ')
          .toLowerCase();

        return searchable.includes(normalizedQuery);
      })
      .slice(0, 20);
  }, [allItems, currentPath, lng, query, role]);

  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl border-zinc-200 bg-white/95 p-0 shadow-2xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
        <DialogHeader className="border-b border-zinc-200 px-4 pb-3 pt-4 dark:border-zinc-800">
          <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {t('commandPalette.title')}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            {t('commandPalette.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="relative border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-11 rounded-xl pl-10 pr-12"
            placeholder={t('commandPalette.placeholder')}
          />
          {query ? (
            <button
              type="button"
              aria-label={t('commandPalette.clear')}
              onClick={() => setQuery('')}
              className="absolute right-6 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3">
          {visibleItems.length > 0 ? (
            <ul className="space-y-1.5">
              {visibleItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'block rounded-xl border border-transparent px-3 py-2 transition-colors',
                      'hover:border-point-2/40 hover:bg-point-4/40 dark:hover:border-point-1/30 dark:hover:bg-point-1/10',
                    )}
                  >
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.title[lng]}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.subtitle}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-2 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {loading ? t('commandPalette.loading') : t('commandPalette.empty')}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
