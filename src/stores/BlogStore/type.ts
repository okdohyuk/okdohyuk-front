import { Blog } from '@api/Blog';

type Status = 'idle' | 'loading' | 'success' | 'fail';

type BlogStoreState = {
  blogs: Blog[] | null;
  status: Status;
  isLastPage: boolean;
  page: number;
  getBlogsPage: (limit: number) => void;
};

export type { BlogStoreState, Status };
