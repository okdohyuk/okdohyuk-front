import { observer } from 'mobx-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { MdOutlineSearch, MdFilterList } from 'react-icons/md';
import useStore from '~/hooks/useStore';
import { MdOutlineViewList, MdGridView } from 'react-icons/md';
import { cls } from '~/utils/classNameUtils';

type BlogSearchBarProps = {
  toggleDrawer: () => void;
};

type BlogSearchBarFC = React.FC<BlogSearchBarProps>;

const BlogSearchBar: BlogSearchBarFC = ({ toggleDrawer }) => {
  const { t } = useTranslation('blog/index');
  const { title, setTitle, viewType, setViewType } = useStore('blogSearchStore');

  return (
    <div className="flex gap-4">
      <label className="relative flex-1">
        <MdOutlineSearch className="w-6 h-6 ml-1 top-1/2 transform -translate-y-1/2 absolute text-white" />
        <input
          className="w-full input-text pl-8"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <button className="button lg:hidden" onClick={toggleDrawer}>
        <MdFilterList />
        {t('filter.index')}
      </button>
      <div className="flex min-h-[32px] p-1 bg-point-3 rounded-md">
        <button
          className={cls('p-1 rounded-md text-white', viewType === 'discript' ? 'bg-point-1' : '')}
          onClick={() => setViewType('discript')}
        >
          <MdOutlineViewList className="w-6 h-6" />
        </button>
        <button
          className={cls('p-1 rounded-md text-white', viewType === 'frame' ? 'bg-point-1' : '')}
          onClick={() => setViewType('frame')}
        >
          <MdGridView className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default observer(BlogSearchBar);