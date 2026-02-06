'use client';

/* eslint-disable react/require-default-props */

import { observer } from 'mobx-react';
import React from 'react';
import FilterDropdown from '@components/complex/FilterDropdown';
import useStore from '@hooks/useStore';
import { cn } from '@utils/cn';
import { BLOG_GLASS_PANEL_SOFT } from '@components/blog/interactiveStyles';
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
        BLOG_GLASS_PANEL_SOFT,
        'w-full p-0',
        hasMargin
          ? 'sticky top-20 mt-8 mr-4 ml-auto h-fit w-[280px] overflow-hidden'
          : 'h-full overflow-y-auto',
      )}
    >
      <FilterDropdown
        title={t('filter.category')}
        items={category}
        changeType={changeCategoryType}
      />
      <FilterDropdown title={t('filter.tag')} items={tags} changeType={changeTagType} />
    </div>
  );
};

export default observer(BlogSearchNav);
