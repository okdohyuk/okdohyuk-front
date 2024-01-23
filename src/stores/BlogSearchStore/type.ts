import { BlogSearch, BlogOrderByEnum, BlogCategory } from '@api/Blog';
import { BlogCardType } from '~/components/blog/BlogCard/type';
import { FilterDropdownItem, FilterType } from '~/components/complex/FilterDropdown/type';

type Status = 'idle' | 'loading' | 'success' | 'fail';

type OptionalBlogs = BlogSearch[] | null;

type BlogSearchStoreState = {
  blogs: OptionalBlogs;
  status: Status;
  count: number;
  isFirst: boolean;
  isLast: boolean;
  viewType: BlogCardType;

  categorys: FilterDropdownItem[];
  tags: FilterDropdownItem[];

  page: number;
  limit: number;
  title: string;
  orderBy: BlogOrderByEnum;

  getBlogList: (reset: boolean) => void;

  setBlogCategorys: (categorys: BlogCategory[]) => void;
  setBlogTags: (tags: string[]) => void;

  setTitle: (title: string) => void;
  setOrderBy: (orderBy: BlogOrderByEnum) => void;
  changeCategoryType: (value: string, type: FilterType) => void;
  changeTagType: (value: string, type: FilterType) => void;

  setViewType: (viewType: BlogCardType) => void;
};

export type { BlogSearchStoreState, Status };
