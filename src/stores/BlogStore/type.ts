import { Blog } from '@api/Blog';

type Status = 'idle' | 'loading' | 'success' | 'fail';

type OptionalBlogs = Blog[] | null;

type BlogStoreState = {
  blogs: OptionalBlogs;
  status: Status;
  isLastPage: boolean;
  page: number;
  setBlogs: (blogs: OptionalBlogs) => void;
  getBlogsPage: (limit: number, authorization?: string) => void;
};

export type { BlogStoreState, Status };
