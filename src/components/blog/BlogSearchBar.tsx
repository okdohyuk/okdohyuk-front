'use client';

import { observer } from 'mobx-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Filter, LayoutGrid, List, Search } from 'lucide-react';
import useStore from '@hooks/useStore';
import { cls } from '@utils/classNameUtils';
import Select from 'components/complex/Select';

type BlogSearchBarProps = {
  toggleDrawer: () => void;
};

type BlogSearchBarFC = React.FC<BlogSearchBarProps>;

const BlogSearchBar: BlogSearchBarFC = ({ toggleDrawer }) => {
  const { t } = useTranslation('blog/index');
  const { title, setTitle, viewType, setViewType, orderBy, setOrderBy } =
    useStore('blogSearchStore');

  const onOrderByChange = (value: string) => {
    if (value === 'RESENT' || value === 'TITLE') {
      setOrderBy(value);
    }
  };

  return (
    <div className="flex gap-4">
      <label className="relative flex-1">
        <Search className="w-6 h-6 ml-1 top-1/2 transform -translate-y-1/2 absolute t-basic-3" />
        <input
          className="w-full input-text pl-8"
          type="text"
          value={title ? title : ''}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <button className="button lg:hidden" onClick={toggleDrawer}>
        <Filter />
        {t('filter.index')}
      </button>
      <div className="flex min-h-[32px] p-1 bg-point-3 rounded-md">
        <button
          className={cls('p-1 rounded-md text-white', viewType === 'discript' ? 'bg-point-1' : '')}
          onClick={() => setViewType('discript')}
        >
          <List className="w-6 h-6" />
        </button>
        <button
          className={cls('p-1 rounded-md text-white', viewType === 'frame' ? 'bg-point-1' : '')}
          onClick={() => setViewType('frame')}
        >
          <LayoutGrid className="w-6 h-6" />
        </button>
      </div>
      <Select value={orderBy} onChange={onOrderByChange} className="h-full w-24">
        <option value="RESENT">{t('filter.orderBy.resent')}</option>
        <option value="TITLE">{t('filter.orderBy.title')}</option>
      </Select>
    </div>
  );
};

export default observer(BlogSearchBar);
