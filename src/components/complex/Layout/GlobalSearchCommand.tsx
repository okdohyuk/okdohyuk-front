'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@components/ui/dialog';
import { menus } from '@assets/datas/menus';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';

type Role = 'ADMIN' | 'USER' | 'GUEST';

type SearchItem = {
  path: string;
  titleByLanguage: Record<Language, string>;
  requiresAdmin?: boolean;
};

const BASIC_PAGES: SearchItem[] = [
  {
    path: '/',
    titleByLanguage: {
      ko: '홈',
      en: 'Home',
      ja: 'ホーム',
      zh: '首页',
    },
  },
  {
    path: '/menu',
    titleByLanguage: {
      ko: '메뉴',
      en: 'Menu',
      ja: 'メニュー',
      zh: '菜单',
    },
  },
  {
    path: '/blog',
    titleByLanguage: {
      ko: '블로그',
      en: 'Blog',
      ja: 'ブログ',
      zh: '博客',
    },
  },
  {
    path: '/terms',
    titleByLanguage: {
      ko: '이용약관',
      en: 'Terms of Service',
      ja: '利用規約',
      zh: '服务条款',
    },
  },
  {
    path: '/privacy',
    titleByLanguage: {
      ko: '개인정보처리방침',
      en: 'Privacy Policy',
      ja: 'プライバシーポリシー',
      zh: '隐私政策',
    },
  },
];

const ADMIN_PAGES: SearchItem[] = [
  {
    path: '/admin',
    requiresAdmin: true,
    titleByLanguage: {
      ko: '관리자',
      en: 'Admin',
      ja: '管理者',
      zh: '管理',
    },
  },
  {
    path: '/admin/blog',
    requiresAdmin: true,
    titleByLanguage: {
      ko: '블로그 관리',
      en: 'Blog Management',
      ja: 'ブログ管理',
      zh: '博客管理',
    },
  },
  {
    path: '/admin/blog/category',
    requiresAdmin: true,
    titleByLanguage: {
      ko: '블로그 카테고리 관리',
      en: 'Blog Category Management',
      ja: 'ブログカテゴリ管理',
      zh: '博客分类管理',
    },
  },
  {
    path: '/admin/reply-report',
    requiresAdmin: true,
    titleByLanguage: {
      ko: '댓글 신고 관리',
      en: 'Reply Report Management',
      ja: 'コメント通報管理',
      zh: '评论举报管理',
    },
  },
  {
    path: '/admin/users',
    requiresAdmin: true,
    titleByLanguage: {
      ko: '사용자 관리',
      en: 'User Management',
      ja: 'ユーザー管理',
      zh: '用户管理',
    },
  },
];

const menuSearchItems: SearchItem[] = menus.service
  .filter((menu) => menu.link.startsWith('/'))
  .map((menu) => ({
    path: menu.link,
    titleByLanguage: menu.title,
  }));

const buildPathFromSitemapLoc = (loc: string): string | null => {
  try {
    const url = new URL(loc);
    return url.pathname;
  } catch {
    if (loc.startsWith('/')) {
      return loc;
    }
    return null;
  }
};

const getPathWithoutLocale = (path: string): string =>
  path.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';

const getLanguageFromPath = (path: string): Language => {
  const match = path.match(/^\/([a-z]{2})(?=\/|$)/);
  if (!match) return 'ko';

  const language = match[1] as Language;
  return ['ko', 'en', 'ja', 'zh'].includes(language) ? language : 'ko';
};

const parseUserRole = (): Role => {
  if (typeof document === 'undefined') return 'GUEST';
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith('user_info='))
    ?.split('=')[1];

  if (!cookie) {
    return 'GUEST';
  }

  try {
    const decoded = decodeURIComponent(cookie);
    const userInfo = JSON.parse(decoded) as { role?: string };

    if (userInfo?.role === 'ADMIN') {
      return 'ADMIN';
    }

    return 'USER';
  } catch {
    return 'GUEST';
  }
};

function GlobalSearchCommand() {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [sitemapPaths, setSitemapPaths] = useState<string[]>([]);
  const [role, setRole] = useState<Role>('GUEST');

  const language = useMemo(() => getLanguageFromPath(pathname || '/ko'), [pathname]);

  useEffect(() => {
    setRole(parseUserRole());
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isK = event.key.toLowerCase() === 'k';
      if (!isK) return;

      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const parseSitemap = (xml: string): string[] => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'application/xml');
      const locNodes = Array.from(doc.querySelectorAll('loc'));

      return locNodes
        .map((node) => buildPathFromSitemapLoc(node.textContent ?? ''))
        .filter((value): value is string => Boolean(value));
    };

    const fetchSitemap = async () => {
      const candidates = ['/sitemap-0.xml', '/sitemap.xml'];
      const results = await Promise.all(
        candidates.map(async (url) => {
          try {
            const response = await fetch(url);
            if (!response.ok) return [] as string[];
            return parseSitemap(await response.text());
          } catch {
            return [] as string[];
          }
        }),
      );

      const validResult = results.find((paths) => paths.length > 0);
      if (validResult) {
        setSitemapPaths(validResult);
      }
    };

    fetchSitemap();
  }, []);

  const indexedItems = useMemo(() => {
    const routeMap = new Map<string, SearchItem>();

    [...BASIC_PAGES, ...menuSearchItems, ...ADMIN_PAGES].forEach((item) => {
      routeMap.set(item.path, item);
    });

    sitemapPaths.forEach((path) => {
      const pathWithoutLocale = getPathWithoutLocale(path);
      if (routeMap.has(pathWithoutLocale)) {
        return;
      }

      const fallbackTitle = pathWithoutLocale
        .split('/')
        .filter(Boolean)
        .slice(-1)[0]
        ?.replace(/-/g, ' ');

      routeMap.set(pathWithoutLocale, {
        path: pathWithoutLocale,
        titleByLanguage: {
          ko: fallbackTitle || '페이지',
          en: fallbackTitle || 'Page',
          ja: fallbackTitle || 'ページ',
          zh: fallbackTitle || '页面',
        },
        requiresAdmin: pathWithoutLocale.startsWith('/admin'),
      });
    });

    return Array.from(routeMap.values()).filter((item) => {
      if (item.requiresAdmin && role !== 'ADMIN') {
        return false;
      }

      return true;
    });
  }, [role, sitemapPaths]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return indexedItems;
    }

    return indexedItems.filter((item) => {
      const title = item.titleByLanguage[language].toLowerCase();
      const path = item.path.toLowerCase();
      return title.includes(normalizedQuery) || path.includes(normalizedQuery);
    });
  }, [indexedItems, language, query]);

  const movePage = (path: string) => {
    setOpen(false);
    setQuery('');
    router.push(`/${language}${path}`);
  };

  return (
    <>
      <button
        type="button"
        className="fixed right-4 top-4 z-30 hidden items-center gap-2 rounded-xl border border-zinc-300/80 bg-white/85 px-3 py-2 text-xs text-zinc-600 shadow-sm backdrop-blur md:flex dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300"
        onClick={() => setOpen(true)}
        aria-label="Open global search"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search</span>
        <kbd className="rounded border border-zinc-300/90 px-1.5 py-0.5 text-[10px] dark:border-zinc-600">
          ⌘/Ctrl + K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[20%] max-w-2xl translate-y-0 rounded-2xl border-zinc-200 p-0 dark:border-zinc-700 dark:bg-zinc-900">
          <DialogTitle className="sr-only">Global page search</DialogTitle>
          <DialogDescription className="sr-only">
            Search and move to page with Ctrl+K or Cmd+K.
          </DialogDescription>

          <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-zinc-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="페이지 이름 또는 경로를 검색하세요"
                className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-500 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="max-h-[50vh] overflow-y-auto p-2">
            {filteredItems.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-zinc-500">
                검색 결과가 없습니다.
              </div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => movePage(item.path)}
                  className={cn(
                    'flex w-full items-start justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors',
                    'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {item.titleByLanguage[language]}
                    </span>
                    <span className="block truncate text-xs text-zinc-500">{item.path}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default GlobalSearchCommand;
