import { action, makeObservable, observable, runInAction } from 'mobx';
import { BlogSearch, BlogOrderByEnum, BlogCategory, BlogSearchResponce } from '@api/Blog';
import { blogApi } from '@api';
import { BlogSearchStoreState, Status } from './type';
import { FilterDropdownItem, FilterType } from '~/components/complex/FilterDropdown/type';
import FilterDropdownUtils from '~/utils/filterDropdownUtil';
import { BlogCardType } from '~/components/blog/BlogCard/type';

class BlogSearchStore implements BlogSearchStoreState {
  @observable public blogs: BlogSearch[] | null = null;
  @observable public status: Status = 'idle';
  @observable public count: number | null = null;
  @observable public isFirst = true;
  @observable public isLast = false;
  @observable public viewType: BlogCardType = 'discript';

  @observable public categorys: FilterDropdownItem[] = [];
  @observable public tags: FilterDropdownItem[] = [];

  @observable public page = 0;
  @observable public limit = 10;
  @observable public title: string | null = null;
  @observable public orderBy: BlogOrderByEnum = BlogOrderByEnum.Resent;

  @observable public prevPath: string | null = null;

  constructor() {
    makeObservable(this);
  }

  @action public setBlogs = (blogs: BlogSearch[]) => (this.blogs = blogs);

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
        getIns(this.categorys),
        getNotIns(this.categorys),
        this.title ? this.title : undefined,
        getIns(this.tags),
        getNotIns(this.tags),
        this.orderBy,
      )
      .then(({ data }) => {
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
      })
      .catch((error) => {
        console.log(error);
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
      this.categorys = FilterDropdownUtils.byBlogCategory(data);
    });
  };

  public findBlogTags = () => {
    blogApi.getBlogTag().then(({ data }) => {
      this.tags = FilterDropdownUtils.byString(data);
    });
  };

  public setBlogCategorys = (categorys: BlogCategory[]) => {
    runInAction(() => {
      this.categorys = FilterDropdownUtils.byBlogCategory(categorys);
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
        } else {
          return { ...item, child: item.child?.length ? change(item.child) : item.child };
        }
      });
    };

    runInAction(() => {
      this.categorys = change(this.categorys);
    });
  };

  public changeTagType = (value: string, type: FilterType) => {
    runInAction(() => {
      this.tags = this.tags.map((item) => {
        if (item.value === value) {
          return { ...item, type };
        } else {
          return item;
        }
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

  public setPrevPath = (prevPath: string | null) => {
    runInAction(() => {
      this.prevPath = prevPath;
    });
  };
}

export default BlogSearchStore;
