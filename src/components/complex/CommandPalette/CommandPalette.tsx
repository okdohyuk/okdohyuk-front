'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Search, ArrowRight, Shield, CornerDownLeft } from 'lucide-react';
import { observer } from 'mobx-react';
import { UserRoleEnum } from '@api/User';
import { Input } from '@components/basic/Input';
import { cn } from '@utils/cn';
import useStore from '@hooks/useStore';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { getServiceCategoryBadge } from '@assets/datas/serviceCategories';
import commandPaletteKo from '@assets/locales/ko/command-palette.json';

type PageEntry = {
  path: string;
  access: 'public' | 'admin';
  titles?: Record<string, string>;
};

type PageKey = keyof typeof commandPaletteKo.pages;

function CommandPalette() {
  const pathname = usePathname();
  const lng = (pathname.split('/')[1] || 'ko') as Language;
  const { t } = useTranslation(lng, 'command-palette');
  const router = useRouter();
  const userStore = useStore('userStore');

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pages, setPages] = useState<PageEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 페이지 데이터 로드
  useEffect(() => {
    if (!open || pages.length > 0) return;

    fetch('/command-palette-pages.json')
      .then((res) => res.json())
      .then((data) => setPages(data.pages || []))
      .catch(() => {
        // JSON 파일이 없는 경우 (빌드 전) 무시
      });
  }, [open, pages.length]);

  // 단축키 등록 (Ctrl+K / Cmd+K)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // 다이얼로그 열릴 때 초기화
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  const getPageTitle = useCallback(
    (page: PageEntry): string => {
      // 1. 빌드 시 생성된 타이틀 사용
      if (page.titles?.[lng]) return page.titles[lng];
      // 2. i18n fallback 타이틀 사용 (command-palette.json의 pages 키)
      const pageKey = page.path as PageKey;
      if (pageKey in commandPaletteKo.pages) {
        return t(`pages.${pageKey}`);
      }
      // 3. 경로 기반 타이틀 생성
      const segments = page.path.split('/').filter(Boolean);
      if (segments.length === 0) return t('pages./');
      return segments[segments.length - 1].replace(/-/g, ' ');
    },
    [lng, t],
  );

  const navigateTo = useCallback(
    (page: PageEntry) => {
      setOpen(false);
      const targetPath = `/${lng}${page.path === '/' ? '' : page.path}`;
      if (pathname !== targetPath) {
        router.push(targetPath);
      }
    },
    [lng, pathname, router],
  );

  // 권한 필터링 + 검색 필터링
  const filteredPages = useMemo(() => {
    const isAdmin = userStore.user?.role === UserRoleEnum.Admin;
    const keyword = query.trim().toLowerCase();

    return pages
      .filter((page) => {
        // 미들웨어 텍스트 기반 권한 필터링: /admin 경로는 Admin 사용자만
        if (page.access === 'admin' && !isAdmin) return false;
        // 로그인 페이지는 이미 로그인한 경우 숨기기
        if (page.path === '/auth/login' && userStore.user) return false;
        return true;
      })
      .filter((page) => {
        if (!keyword) return true;

        const title = getPageTitle(page).toLowerCase();
        const path = page.path.toLowerCase();
        const allTitles = page.titles ? Object.values(page.titles).join(' ').toLowerCase() : '';

        return title.includes(keyword) || path.includes(keyword) || allTitles.includes(keyword);
      });
  }, [pages, query, userStore.user, getPageTitle]);

  // 선택 인덱스 보정
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // 키보드 네비게이션
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, filteredPages.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredPages[selectedIndex]) {
            navigateTo(filteredPages[selectedIndex]);
          }
          break;
        default:
          break;
      }
    },
    [filteredPages, selectedIndex, navigateTo],
  );

  // 선택된 항목이 보이도록 스크롤
  useEffect(() => {
    const selectedEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selectedEl?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const getCategoryBadge = useCallback(
    (page: PageEntry): string | null => {
      if (page.access === 'admin') return t('adminBadge');

      try {
        return getServiceCategoryBadge(lng, page.path);
      } catch {
        return null;
      }
    },
    [lng, t],
  );

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          )}
        />
        <DialogPrimitive.Content
          onKeyDown={handleKeyDown}
          className={cn(
            'fixed left-[50%] top-[15%] z-50 w-full max-w-lg translate-x-[-50%]',
            'rounded-2xl border border-zinc-200/70 bg-white shadow-2xl',
            'dark:border-zinc-700/70 dark:bg-zinc-900',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2',
            'data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]',
            'duration-200',
          )}
        >
          <DialogPrimitive.Title className="sr-only">{t('hint')}</DialogPrimitive.Title>

          {/* 검색 입력 */}
          <div className="flex items-center gap-3 border-b border-zinc-200 px-4 dark:border-zinc-700">
            <Search className="h-5 w-5 shrink-0 text-zinc-400" />
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('placeholder')}
              className="min-h-12 border-0 bg-transparent px-0 text-base focus:ring-0 dark:bg-transparent"
              autoFocus
            />
            <kbd className="hidden shrink-0 rounded-md border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 sm:inline-block">
              ESC
            </kbd>
          </div>

          {/* 결과 목록 */}
          <div ref={listRef} className="max-h-[min(60vh,400px)] overflow-y-auto p-2">
            {filteredPages.length > 0 ? (
              filteredPages.map((page, index) => {
                const title = getPageTitle(page);
                const categoryBadge = getCategoryBadge(page);
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={page.path}
                    type="button"
                    data-index={index}
                    onClick={() => navigateTo(page)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                      isSelected
                        ? 'bg-point-4/50 dark:bg-point-1/20'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                    )}
                  >
                    {page.access === 'admin' ? (
                      <Shield className="h-4 w-4 shrink-0 text-amber-500" />
                    ) : (
                      <ArrowRight className="h-4 w-4 shrink-0 text-zinc-400" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {title}
                        </span>
                        {categoryBadge && (
                          <span className="shrink-0 rounded-full bg-zinc-200/80 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
                            {categoryBadge}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                        /{lng}
                        {page.path === '/' ? '' : page.path}
                      </p>
                    </div>
                    {isSelected && (
                      <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {t('noResults')}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {t('noResultsHint')}
                </p>
              </div>
            )}
          </div>

          {/* 하단 힌트 */}
          <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-2 dark:border-zinc-700">
            <p className="text-xs text-zinc-400">{t('hint')}</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <kbd className="rounded border border-zinc-200 bg-zinc-100 px-1 py-0.5 text-[10px] text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  ↑↓
                </kbd>
                <kbd className="rounded border border-zinc-200 bg-zinc-100 px-1 py-0.5 text-[10px] text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  ↵
                </kbd>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default observer(CommandPalette);
