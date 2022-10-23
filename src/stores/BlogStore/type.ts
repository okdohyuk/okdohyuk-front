import { Blog } from '@assets/type';

type Status = 'idle' | 'loading' | 'success' | 'fail';

type BlogStoreState = {
  blogs: Blog[] | null;
  status: Status;
  isLastPage: boolean;
  page: number;
};

export type { BlogStoreState, Status };
