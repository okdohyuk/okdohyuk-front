import { BlogStoreState, Status } from '@stores/BlogStore/type';
import { action, makeObservable, observable, runInAction } from 'mobx';
import { Blog } from '@assets/type';
import { customAxios } from '@libs/client/customAxios';

class BlogStore implements BlogStoreState {
  @observable blogs: Blog[] | null = null;
  @observable status: Status = 'idle';
  @observable isLastPage = false;

  constructor() {
    makeObservable(this);
  }

  @action setBlogs = (blogs: Blog[] | null) => (this.blogs = blogs);

  @action getBlogsPage = (page: number, limit: number) => {
    runInAction(() => {
      this.status = 'loading';
    });
    customAxios.get(`blog/list?page=${page}&limit=${limit}`).then(({ data: { blogs } }) => {
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
      });
    });
  };
}

export default BlogStore;
