import { observer } from 'mobx-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FilterDropdown from '@components/complex/FilterDropdown';
import useStore from '@hooks/useStore';
import { cls } from '@utils/classNameUtils';

type BlogSearchNavProps = {
  hasMargin?: boolean;
};

type BlogSearchNavFC = React.FC<BlogSearchNavProps>;

const BlogSearchNav: BlogSearchNavFC = ({ hasMargin = false }) => {
  const { categorys, tags, changeCategoryType, changeTagType } = useStore('blogSearchStore');
  const { t } = useTranslation('blog/index');

  return (
    <div
      className={cls(
        'w-[250px] bg-basic-3 p-0',
        hasMargin ? 'h-fit mt-8 mr-4 ml-auto rounded overflow-hidden' : 'h-full overflow-y-scroll',
      )}
    >
      <FilterDropdown
        title={t('filter.category')}
        items={categorys}
        changeType={changeCategoryType}
      />
      <FilterDropdown title={t('filter.tag')} items={tags} changeType={changeTagType} />
    </div>
  );
};

export default observer(BlogSearchNav);
