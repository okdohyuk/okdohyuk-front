import { useEffect, useState } from 'react';
import useInfiniteScroll from '../useInfiniteScroll';
import useStore from '../useStore';
import { useRouter } from 'next/router';
import FilterDropdownUtils from '~/utils/filterDropdownUtil';
import { BlogCategory } from '~/spec/api/Blog';
import { FilterType } from '~/components/complex/FilterDropdown/type';
import useDebounce from '../useDebounce';

const useBlogSearch = (initCategorys: BlogCategory[], initTags: string[]) => {
  const {
    blogs,
    getBlogList,
    status,
    setBlogCategorys,
    setBlogTags,
    categorys: findCategorys,
    tags: findTags,
    orderBy,
    title,
    setOrderBy,
    setTitle,
    changeTagType,
    changeCategoryType,
  } = useStore('blogSearchStore');
  const { setIsFetching, isFetching } = useInfiniteScroll();
  const { query, isReady } = useRouter();
  const [isFirst, setIsFirst] = useState(true);
  const titleD = useDebounce(title, 1000);

  // 최초 렌더링 시 검색 조건 적용
  useEffect(() => {
    if (!isReady || !isFirst) return;
    setBlogCategorys(initCategorys);
    setBlogTags(initTags);

    const { findValueByChain } = FilterDropdownUtils;
    const { orderBy, title, categoryIn, categoryNotIn, tagIn, tagNotIn } = query;

    const handleCategory = (category: string, type: FilterType) => {
      const categoryChain = category.split(',');
      const categoryValue = findValueByChain(categoryChain, findCategorys);
      if (categoryValue) {
        changeCategoryType(categoryValue, type);
      }
    };

    const handleTag = (tag: string, type: FilterType) => {
      const tagArray = tag.split(',');
      tagArray.forEach((value) => {
        changeTagType(value, type);
      });
    };

    if (title && typeof title === 'string') {
      setTitle(title);
    }
    if (orderBy === 'RESENT' || orderBy === 'TITLE') {
      setOrderBy(orderBy);
    }
    if (categoryIn) {
      if (typeof categoryIn === 'string') {
        handleCategory(categoryIn, 'in');
      } else if (Array.isArray(categoryIn)) {
        categoryIn.forEach((element) => handleCategory(element, 'in'));
      }
    }
    if (categoryNotIn) {
      if (typeof categoryNotIn === 'string') {
        handleCategory(categoryNotIn, 'notIn');
      } else if (Array.isArray(categoryNotIn)) {
        categoryNotIn.forEach((element) => handleCategory(element, 'notIn'));
      }
    }
    if (tagIn && typeof tagIn === 'string') {
      handleTag(tagIn, 'in');
    }
    if (tagNotIn && typeof tagNotIn === 'string') {
      handleTag(tagNotIn, 'notIn');
    }

    setIsFirst(false);
  }, [query, isReady, initCategorys, initTags]);

  // 무한 스크롤 로직
  useEffect(() => {
    if (!isFetching) return;
    getBlogList(false);
  }, [isFetching]);

  useEffect(() => {
    if (status === 'success') {
      setIsFetching(false);
    }
  }, [status]);

  // 검색 조건 변경 시 적용
  useEffect(() => {
    if (isFirst) return;
    getBlogList(true);
  }, [titleD, orderBy, findCategorys, findTags, isFirst]);

  return { blogs, status };
};

export default useBlogSearch;
