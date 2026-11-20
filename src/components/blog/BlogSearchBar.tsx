'use client';

import { observer } from 'mobx-react';
import React, { useCallback, useEffect } from 'react';
import { LayoutGrid, List, Search, SlidersHorizontal } from 'lucide-react';
import useStore from '@hooks/useStore';
import { cn } from '@utils/cn';
import { BlogOrderByEnum } from '@api/Blog';
import { sendGAEvent } from '@libs/client/gtag';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { BlogCardType } from './BlogCard/type';

const CONTROL =
  'h-10 rounded-lg border border-basic-3 bg-basic-0 text-sm outline-none transition-colors duration-150 dark:bg-basic-1';

const FOCUS_RING = 'focus-ring';

const VIEW_OPTIONS: {
  type: BlogCardType;
  Icon: typeof List;
  labelKey: 'view.list' | 'view.grid';
}[] = [
  { type: 'discript', Icon: List, labelKey: 'view.list' },
  { type: 'frame', Icon: LayoutGrid, labelKey: 'view.grid' },
];

type BlogSearchBarProps = {
  toggleDrawer: () => void;
  lng: Language;
};

function BlogSearchBar({ toggleDrawer, lng }: BlogSearchBarProps) {
  const { t } = useTranslation(lng, 'blog/index');
  const { title, setTitle, viewType, setViewType, orderBy, setOrderBy } =
    useStore('blogSearchStore');

  const onOrderByChange = useCallback(
    (value: string) => {
      if (
        value === BlogOrderByEnum.Resent ||
        value === BlogOrderByEnum.Title ||
        value === BlogOrderByEnum.Views
      ) {
        setOrderBy(value as (typeof BlogOrderByEnum)[keyof typeof BlogOrderByEnum]);
        sendGAEvent('blog_sort_change', value, { sort_value: value });
      }
    },
    [setOrderBy],
  );

  useEffect(() => {
    if (!title?.trim()) return undefined;
    const keyword = title.trim().slice(0, 50);
    const timer = setTimeout(() => {
      sendGAEvent('blog_search', keyword, { search_keyword: keyword });
    }, 1000);
    return () => clearTimeout(timer);
  }, [title]);

  return (
    // Toolbar sits on the page canvas: no panel, controls share one 40px height.
    <div className="mb-4 flex flex-wrap items-center gap-2 md:flex-nowrap">
      <label className="relative min-w-56 flex-1" htmlFor="blog-search-input">
        <span className="sr-only">{t('searchPlaceholder')}</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-5"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          id="blog-search-input"
          className={cn(
            CONTROL,
            'w-full pl-9 pr-3 text-fg-1 placeholder:text-fg-5 focus:border-focus focus:ring-2 focus:ring-point-2/25',
          )}
          type="search"
          placeholder={t('searchPlaceholder')}
          value={title ?? ''}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <button
        type="button"
        className={cn(
          CONTROL,
          'inline-flex items-center gap-2 px-3 text-fg-3 hover:bg-basic-2 hover:text-fg-1 lg:hidden',
          FOCUS_RING,
        )}
        onClick={toggleDrawer}
      >
        <SlidersHorizontal className="h-4 w-4 text-fg-5" strokeWidth={1.75} aria-hidden />
        {t('filter.index')}
      </button>

      {/* Segmented view switch: selection is a raised surface step, not an accent fill */}
      <div
        role="group"
        className="inline-flex h-10 items-center gap-1 rounded-lg border border-basic-3 bg-basic-2 p-1"
      >
        {VIEW_OPTIONS.map(({ type, Icon, labelKey }) => {
          const isSelected = viewType === type;
          return (
            <button
              key={type}
              type="button"
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-150',
                FOCUS_RING,
                isSelected
                  ? 'bg-basic-0 text-fg-1 shadow-xs dark:bg-basic-3'
                  : 'text-fg-5 hover:text-fg-2',
              )}
              onClick={() => setViewType(type)}
              aria-pressed={isSelected}
              aria-label={t(labelKey)}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </button>
          );
        })}
      </div>

      <Select value={orderBy} onValueChange={onOrderByChange}>
        <SelectTrigger aria-label={t('sortLabel')} className="h-10 w-32 dark:bg-basic-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={BlogOrderByEnum.Resent}>{t('filter.orderBy.resent')}</SelectItem>
          <SelectItem value={BlogOrderByEnum.Title}>{t('filter.orderBy.title')}</SelectItem>
          <SelectItem value={BlogOrderByEnum.Views}>{t('filter.orderBy.views')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default observer(BlogSearchBar);
