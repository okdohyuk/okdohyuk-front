import { BlogStoreState, Status } from '@stores/BlogStore/type';
import { action, makeObservable, observable, runInAction } from 'mobx';
import { Blog, BlogApi } from '@api/Blog';

class BlogStore implements BlogStoreState {
  @observable blogs: Blog[] | null = null;
  @observable status: Status = 'idle';
  @observable isLastPage = false;
  @observable page = 0;

  private blogApi = new BlogApi();

  constructor() {
    makeObservable(this);
  }

  @action setBlogs = (blogs: Blog[] | null) => (this.blogs = blogs);

  @action getBlogsPage = (limit: number) => {
    runInAction(() => {
      this.status = 'loading';
    });
    this.blogApi.getBlog(this.page, limit).then(({ data: blogs }) => {
      runInAction(() => {
        if (!blogs.length) {
          this.isLastPage = true;
        } else {
          if (this.blogs === null) {
            this.blogs = blogs;
          } else {
            this.blogs = [...this.blogs, ...blogs];
          }
          if (limit > blogs.length) this.isLastPage = true;
        }
        this.status = 'success';
        this.page += 1;
      });
    });
  };
}

export default BlogStore;
