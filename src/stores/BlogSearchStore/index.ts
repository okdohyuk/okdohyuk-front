import { action, makeObservable, observable, runInAction } from 'mobx';
import { BlogCategory, BlogOrderByEnum, BlogSearch, BlogSearchResponce } from '@api/Blog';
import { blogApi } from '@api';
import { BlogCardType } from '@components/blog/BlogCard/type';
import logger from '@utils/logger';
import { FilterDropdownItem, FilterType } from '~/components/complex/FilterDropdown/type';
import FilterDropdownUtils from '~/utils/filterDropdownUtil';
import { BlogSearchStoreState, Status } from './type';

class BlogSearchStore implements BlogSearchStoreState {
  @observable public blogs: BlogSearch[] | null = null;

  @observable public status: Status = 'idle';

  @observable public count: number | null = null;

  @observable public isFirst = true;

  @observable public isLast = false;

  @observable public viewType: BlogCardType = 'discript';

  // 뷰포트 기반 기본 뷰 초기화를 1회만 수행하기 위한 가드(관찰 대상 아님).
  private viewTypeInitialized = false;

  @observable public category: FilterDropdownItem[] = [];

  @observable public tags: FilterDropdownItem[] = [];

  @observable public page = 0;

  @observable public limit = 10;

  @observable public title: string | null = null;

  @observable public orderBy: BlogOrderByEnum = BlogOrderByEnum.Resent;

  @observable public prevPath: string | null = null;

  constructor() {
    makeObservable(this);
  }

  @action public setBlogs = (blogs: BlogSearch[]) => {
    this.blogs = blogs;
  };

  @action public getBlogList = async (reset: boolean) => {
    const { getIns, getNotIns } = FilterDropdownUtils;
    if (reset) {
      runInAction(() => {
        this.page = 0;
        this.blogs = null;
        this.status = 'idle';
      });
    }
    if (!reset && this.isLast) return;
    runInAction(() => {
      this.status = 'loading';
    });

    await blogApi
      .getBlogSearch(
        this.page,
        this.limit,
        getIns(this.category),
        getNotIns(this.category),
        this.title ? this.title : undefined,
        getIns(this.tags),
        getNotIns(this.tags),
        this.orderBy,
      )
      .then(({ data }) => {
        runInAction(() => {
          this.count = data.count;
          this.isFirst = data.isFirst;
          this.isLast = data.isLast;

          if (this.blogs === null) {
            this.blogs = data.results;
          } else {
            this.blogs = [...this.blogs, ...data.results];
          }

          this.status = 'success';
          this.page += 1;
        });
      })
      .catch((error) => {
        logger.error(error);
      });
  };

  public setBlogList = (data: BlogSearchResponce) => {
    runInAction(() => {
      if (this.blogs === null) {
        this.count = data.count;
        this.isFirst = data.isFirst;
        this.isLast = data.isLast;
        this.blogs = data.results;

        this.status = 'success';
        this.page = 1;
      }
    });
  };

  public findBlogCategorys = () => {
    blogApi.getBlogCategory().then(({ data }) => {
      this.category = FilterDropdownUtils.byBlogCategory(data);
    });
  };

  public findBlogTags = () => {
    blogApi.getBlogTag().then(({ data }) => {
      this.tags = FilterDropdownUtils.byString(data);
    });
  };

  public setBlogCategorys = (category: BlogCategory[]) => {
    runInAction(() => {
      this.category = FilterDropdownUtils.byBlogCategory(category);
    });
  };

  public setBlogTags = (tags: string[]) => {
    runInAction(() => {
      this.tags = FilterDropdownUtils.byString(tags);
    });
  };

  public changeCategoryType = (value: string, type: FilterType) => {
    const change = (items: FilterDropdownItem[]): FilterDropdownItem[] => {
      return items.map((item) => {
        if (item.value === value) {
          return { ...item, type };
        }
        return { ...item, child: item.child?.length ? change(item.child) : item.child };
      });
    };

    runInAction(() => {
      this.category = change(this.category);
    });
  };

  public changeTagType = (value: string, type: FilterType) => {
    runInAction(() => {
      this.tags = this.tags.map((item) => {
        if (item.value === value) {
          return { ...item, type };
        }
        return item;
      });
    });
  };

  public setOrderBy = (orderBy: BlogOrderByEnum) => {
    runInAction(() => {
      this.orderBy = orderBy;
    });
  };

  public setTitle = (title: string) => {
    runInAction(() => {
      this.title = title;
    });
  };

  public setViewType = (viewType: BlogCardType) => {
    runInAction(() => {
      this.viewType = viewType;
    });
  };

  // 최초 진입 시 뷰포트에 따라 기본 뷰를 정한다.
  // 태블릿/PC(≥768px, Tailwind md)는 그리드(frame), 모바일은 리스트(discript) 유지.
  // 1회만 적용해 이후 사용자의 수동 토글은 덮어쓰지 않는다.
  public initViewTypeByViewport = () => {
    if (typeof window === 'undefined' || this.viewTypeInitialized) return;
    this.viewTypeInitialized = true;
    if (window.matchMedia('(min-width: 768px)').matches) {
      runInAction(() => {
        this.viewType = 'frame';
      });
    }
  };

  public setPrevPath = (prevPath: string | null) => {
    runInAction(() => {
      this.prevPath = prevPath;
    });
  };
}

export default BlogSearchStore;
