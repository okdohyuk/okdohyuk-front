import { useEffect } from 'react';
import useInfiniteScroll from '../useInfiniteScroll';
import useStore from '../useStore';

const useBlogSearch = () => {
  /** use 블로그 검색 추가  */
  /** 블로그 검색 스토어 추가 */
  const { blogs, getBlogsPage, status, isLastPage } = useStore('blogStore');
  const { setIsFetching, isFetching } = useInfiniteScroll();

  useEffect(() => {
    if (!isFetching) return;
    getBlogsPage(10);
  }, [isFetching]);

  useEffect(() => {
    if (isLastPage) return;
    if (status === 'success') {
      setIsFetching(false);
    }
  }, [status, isLastPage]);

  useEffect(() => {
    if (status === 'idle') setIsFetching(true);
  }, []);

  return { blogs, status };
};

export default useBlogSearch;
