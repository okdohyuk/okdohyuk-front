'use client';

import { observer } from 'mobx-react';
import React from 'react';
import FilterDropdown from '@components/complex/FilterDropdown';
import useStore from '@hooks/useStore';
import { cls } from '@utils/classNameUtils';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';

type BlogSearchNavProps = {
  hasMargin?: boolean;
  lng: Language;
};

type BlogSearchNavFC = React.FC<BlogSearchNavProps>;

const BlogSearchNav: BlogSearchNavFC = ({ hasMargin = false, lng }) => {
  const { category, tags, changeCategoryType, changeTagType } = useStore('blogSearchStore');
  const { t } = useTranslation(lng, 'blog/index');

  return (
    <div
      className={cls(
        'w-[250px] bg-basic-3 p-0',
        hasMargin ? 'h-fit mt-8 mr-4 ml-auto rounded overflow-hidden' : 'h-full overflow-y-scroll',
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
