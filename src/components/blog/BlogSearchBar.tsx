'use client';

import { observer } from 'mobx-react';
import React, { useCallback } from 'react';
import { Filter, LayoutGrid, List, Search } from 'lucide-react';
import useStore from '@hooks/useStore';
import { cn } from '@utils/cn';
import { motion, useReducedMotion } from 'framer-motion';
import { BlogOrderByEnum } from '@api/Blog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { BLOG_GLASS_PANEL_SOFT } from './interactiveStyles';

type BlogSearchBarProps = {
  toggleDrawer: () => void;
  lng: Language;
};

function BlogSearchBar({ toggleDrawer, lng }: BlogSearchBarProps) {
  const { t } = useTranslation(lng, 'blog/index');
  const { title, setTitle, viewType, setViewType, orderBy, setOrderBy } =
    useStore('blogSearchStore');
  const shouldReduceMotion = useReducedMotion();

  const onOrderByChange = useCallback(
    (value: string) => {
      if (value === BlogOrderByEnum.Resent || value === BlogOrderByEnum.Title) {
        setOrderBy(value as (typeof BlogOrderByEnum)[keyof typeof BlogOrderByEnum]);
      }
    },
    [setOrderBy],
  );

  return (
    <motion.div
      className={cn(
        BLOG_GLASS_PANEL_SOFT,
        'mb-4 flex flex-wrap items-center gap-3 p-3 md:flex-nowrap',
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
    >
      <label className="relative min-w-[220px] flex-1" htmlFor="blog-search-input">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
        <input
          id="blog-search-input"
          className="h-[46px] w-full rounded-xl border border-zinc-200 bg-white/90 pl-10 pr-3 text-sm font-medium text-zinc-800 outline-none transition focus:border-point-2 focus:ring-2 focus:ring-point-2/40 dark:border-zinc-700 dark:bg-zinc-800/90 dark:text-zinc-100"
          type="text"
          placeholder={t('searchPlaceholder')}
          value={title ?? ''}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <motion.button
        type="button"
        className="inline-flex h-[46px] items-center gap-1 rounded-xl border border-zinc-200 bg-white/90 px-3 text-sm font-semibold text-zinc-700 transition-colors hover:border-point-2 hover:text-point-1 dark:border-zinc-700 dark:bg-zinc-800/90 dark:text-zinc-200 lg:hidden"
        onClick={toggleDrawer}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
      >
        <Filter />
        {t('filter.index')}
      </motion.button>

      <div className="inline-flex h-[46px] items-center rounded-xl border border-zinc-200 bg-zinc-100/90 p-1 dark:border-zinc-700 dark:bg-zinc-800/90">
        <motion.button
          type="button"
          className={cn(
            'rounded-lg p-2 transition-colors',
            viewType === 'discript'
              ? 'bg-point-1 text-white'
              : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200',
          )}
          onClick={() => setViewType('discript')}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
          aria-label="Description view"
        >
          <List className="h-5 w-5" />
        </motion.button>
        <motion.button
          type="button"
          className={cn(
            'rounded-lg p-2 transition-colors',
            viewType === 'frame'
              ? 'bg-point-1 text-white'
              : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200',
          )}
          onClick={() => setViewType('frame')}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
          aria-label="Grid view"
        >
          <LayoutGrid className="h-5 w-5" />
        </motion.button>
      </div>

      <Select value={orderBy} onValueChange={onOrderByChange}>
        <SelectTrigger className="h-[46px] w-[128px] rounded-xl bg-white/90 text-sm font-semibold dark:bg-zinc-800/90">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={BlogOrderByEnum.Resent}>{t('filter.orderBy.resent')}</SelectItem>
          <SelectItem value={BlogOrderByEnum.Title}>{t('filter.orderBy.title')}</SelectItem>
        </SelectContent>
      </Select>
    </motion.div>
  );
}

export default observer(BlogSearchBar);
