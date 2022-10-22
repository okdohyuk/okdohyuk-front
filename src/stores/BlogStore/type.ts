import { Blog } from '@assets/type';

type Status = 'idle' | 'loading' | 'success' | 'fail';

type BlogStoreState = {
  blogs: Blog[] | null;
  status: Status;
  isLastPage: boolean;
};

export type { BlogStoreState, Status };
