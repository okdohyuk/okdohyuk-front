import { useState, useEffect, useCallback } from 'react';

const useInfiniteScroll = () => {
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const handleScroll = useCallback(() => {
    const { scrollHeight } = document.documentElement;
    const { scrollTop } = document.documentElement;
    const clientHeight = window.innerHeight;
    if (scrollTop === 0) return;
    if (scrollTop + clientHeight >= scrollHeight - 400 && !isFetching) {
      setIsFetching(true);
    }
  }, [isFetching]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return {
    isFetching,
    setIsFetching,
    handleScroll,
  };
};

export default useInfiniteScroll;
