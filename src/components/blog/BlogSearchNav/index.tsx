'use client';

/* eslint-disable react/require-default-props */

import { observer } from 'mobx-react';
import React from 'react';
import FilterDropdown from '@components/complex/FilterDropdown';
import TagFilterSection from '@components/complex/TagFilterSection';
import useStore from '@hooks/useStore';
import { cn } from '@utils/cn';
import { BLOG_PANEL } from '@components/blog/interactiveStyles';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

type BlogSearchNavProps = {
  hasMargin?: boolean;
  lng: Language;
};

const BlogSearchNav = function BlogSearchNav({ hasMargin = false, lng }: BlogSearchNavProps) {
  const { category, tags, changeCategoryType, changeTagType } = useStore('blogSearchStore');
  const { t } = useTranslation(lng, 'blog/index');

  return (
    <div
      className={cn(
        'w-full',
        // Desktop: a sticky card beside the column, top-aligned with the page header.
        // Drawer: the drawer itself is the surface, so no second box here.
        hasMargin
          ? `${BLOG_PANEL} sticky top-8 mx-4 mt-8 h-fit w-64 shrink-0 overflow-hidden`
          : 'h-full overflow-y-auto',
      )}
    >
      <FilterDropdown
        title={t('filter.category')}
        items={category}
        changeType={changeCategoryType}
      />
      <TagFilterSection title={t('filter.tag')} items={tags} changeType={changeTagType} />
    </div>
  );
};

export default observer(BlogSearchNav);
