import { useState, useEffect } from 'react';

const useInfiniteScroll = () => {
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const handleScroll = () => {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = window.innerHeight;
    if (scrollTop === 0) return;
    if (scrollTop + clientHeight >= scrollHeight - 400 && !isFetching) {
      setIsFetching(true);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return {
    isFetching,
    setIsFetching,
    handleScroll,
  };
};

export default useInfiniteScroll;
