import { BlogStoreState, Status } from '@stores/BlogStore/type';
import { action, makeObservable, observable, runInAction } from 'mobx';
import { Blog } from '@api/Blog';
import { blogApi } from '~/spec/api';

class BlogStore implements BlogStoreState {
  @observable public blogs: Blog[] | null = null;
  @observable public status: Status = 'idle';
  @observable public isLastPage = false;
  @observable public page = 0;

  constructor() {
    makeObservable(this);
  }

  @action public setBlogs: BlogStoreState['setBlogs'] = (blogs) => (this.blogs = blogs);

  @action public getBlogsPage: BlogStoreState['getBlogsPage'] = (limit, authorization) => {
    runInAction(() => {
      this.status = 'loading';
    });
    blogApi
      .getBlogList(this.page, limit, authorization && 'Bearer ' + authorization)
      .then(({ data: blogs }) => {
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
      })
      .catch((error) => {
        console.log(error);
      });
  };
}

export default BlogStore;
