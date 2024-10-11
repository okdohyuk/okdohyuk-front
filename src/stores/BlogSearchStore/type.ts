import { BlogSearch, BlogOrderByEnum, BlogCategory, BlogSearchResponce } from '@api/Blog';
import { BlogCardType } from '@components/legacy/blog/BlogCard/type';
import { FilterDropdownItem, FilterType } from '~/components/complex/FilterDropdown/type';

type Status = 'idle' | 'loading' | 'success' | 'fail';

type OptionalBlogs = BlogSearch[] | null;

type BlogSearchStoreState = {
  blogs: OptionalBlogs;
  status: Status;
  count: number | null;
  isFirst: boolean;
  isLast: boolean;
  viewType: BlogCardType;

  setBlogs: (blogs: BlogSearch[]) => void;

  category: FilterDropdownItem[];
  tags: FilterDropdownItem[];

  page: number;
  limit: number;
  title: string | null;
  orderBy: BlogOrderByEnum;

  prevPath: string | null;

  getBlogList: (reset: boolean) => void;
  setBlogList: (data: BlogSearchResponce) => void;

  setBlogCategorys: (category: BlogCategory[]) => void;
  setBlogTags: (tags: string[]) => void;

  setTitle: (title: string) => void;
  setOrderBy: (orderBy: BlogOrderByEnum) => void;
  changeCategoryType: (value: string, type: FilterType) => void;
  changeTagType: (value: string, type: FilterType) => void;

  setViewType: (viewType: BlogCardType) => void;
  setPrevPath: (prevPath: string | null) => void;
};

export type { BlogSearchStoreState, Status };
