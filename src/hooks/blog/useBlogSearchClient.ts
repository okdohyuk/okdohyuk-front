'use client';

import { useEffect, useRef } from 'react';
import useInfiniteScroll from '../useInfiniteScroll';
import useStore from '../useStore';
import FilterDropdownUtils from '~/utils/filterDropdownUtil';
import { FilterType } from '~/components/complex/FilterDropdown/type';
import useDebounce from '../useDebounce';
import { useSearchParams, useRouter } from 'next/navigation';
import { BlogCategory } from '@api/Blog';

const useBlogSearch = (category: BlogCategory[], tags: string[]) => {
  const {
    blogs,
    getBlogList,
    status,
    setBlogCategorys,
    setBlogTags,
    category: findCategorys,
    tags: findTags,
    orderBy,
    title: titleS,
    setOrderBy,
    setTitle,
    changeTagType,
    changeCategoryType,
    prevPath,
    setPrevPath,
  } = useStore('blogSearchStore');
  const searchParams = useSearchParams();
  const { setIsFetching, isFetching } = useInfiniteScroll();
  const { replace } = useRouter();
  const titleD = useDebounce(titleS, 1000);
  const hasFetchedFirstBlogs = useRef(false);
  const hasFetchedMenu = useRef(false);

  useEffect(() => {
    if (hasFetchedMenu.current) return;
    hasFetchedMenu.current = true;
    setBlogCategorys(category);
    setBlogTags(tags);
  }, [setBlogCategorys, setBlogTags]);

  // 최초 렌더링 시 검색 조건 적용
  useEffect(() => {
    if (!searchParams) return;
    if (findCategorys.length === 0 || findTags.length === 0) return;
    if (hasFetchedFirstBlogs.current) return;

    const { findValueByChain } = FilterDropdownUtils;

    // const { orderBy, keyword, categoryIn, categoryNotIn, tagIn, tagNotIn } = query;
    const keyword = searchParams.get('keyword');
    const orderBy = searchParams.get('orderBy');
    const categoryIn = searchParams.getAll('categoryIn');
    const categoryNotIn = searchParams.getAll('categoryNotIn');
    const tagIn = searchParams.getAll('tagIn');
    const tagNotIn = searchParams.getAll('tagNotIn');

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

    if (keyword) {
      setTitle(keyword);
    } else {
      setTitle('');
    }

    if (orderBy === 'RESENT' || orderBy === 'TITLE') {
      setOrderBy(orderBy);
    } else {
      setOrderBy('RESENT');
    }
    if (categoryIn) {
      if (categoryIn.length === 1) {
        handleCategory(categoryIn[0], 'in');
      } else {
        categoryIn.forEach((element) => handleCategory(element, 'in'));
      }
    }
    if (categoryNotIn) {
      if (categoryNotIn.length === 1) {
        handleCategory(categoryNotIn[0], 'notIn');
      } else {
        categoryNotIn.forEach((element) => handleCategory(element, 'notIn'));
      }
    }
    if (tagIn.length === 1) {
      handleTag(tagIn[0], 'in');
    }
    if (tagNotIn.length === 1) {
      handleTag(tagNotIn[0], 'notIn');
    }

    hasFetchedFirstBlogs.current = true;
    setIsFetching(true);
  }, [
    searchParams,
    findCategorys,
    findTags,
    setBlogCategorys,
    setBlogTags,
    changeCategoryType,
    changeTagType,
    setTitle,
    setOrderBy,
  ]);

  // 무한 스크롤 로직
  useEffect(() => {
    if (!isFetching) return;
    getBlogList(false);
  }, [getBlogList, isFetching]);

  useEffect(() => {
    if (status === 'success') {
      setIsFetching(false);
    }
  }, [setIsFetching, status]);

  // 검색 조건 변경 시 적용
  useEffect(() => {
    if (!hasFetchedFirstBlogs.current || titleD === null) return;

    const stringParams: { [key: string]: string } = {
      keyword: titleD ? titleD : '',
      tagIn: FilterDropdownUtils.getIns(findTags).toString(),
      tagNotIn: FilterDropdownUtils.getNotIns(findTags).toString(),
    };

    const arraryParams: { [key: string]: string[][] } = {
      categoryIn: FilterDropdownUtils.getInsChain(findCategorys),
      categoryNotIn: FilterDropdownUtils.getNotInsChain(findCategorys),
    };

    const params = new URLSearchParams();

    for (const key in stringParams) {
      if (stringParams[key] !== undefined && stringParams[key] !== '') {
        params.append(key, stringParams[key]);
      }
    }
    for (const key in arraryParams) {
      if (arraryParams[key].length !== 0) {
        arraryParams[key].forEach((value) => {
          params.append(key, value.toString());
        });
      }
    }
    if (orderBy !== 'RESENT') {
      params.append('orderBy', orderBy);
    }
    const url = '/blog' + (params.size === 0 ? '' : '?' + params.toString());
    if (prevPath === url) return;
    replace(url);
    if (prevPath !== null) getBlogList(true);
    setPrevPath(url);
  }, [titleD, orderBy, findCategorys, findTags, prevPath, replace, setPrevPath, getBlogList]);

  return { blogs, status };
};

export default useBlogSearch;
