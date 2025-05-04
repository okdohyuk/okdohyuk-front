'use client';

import { useEffect, useRef, useCallback } from 'react';
import useInfiniteScroll from '../useInfiniteScroll';
import useStore from '../useStore';
import FilterDropdownUtils from '~/utils/filterDropdownUtil';
import { FilterType } from '~/components/complex/FilterDropdown/type';
import useDebounce from '../useDebounce';
import { useSearchParams, useRouter } from 'next/navigation';
import { BlogCategory, BlogOrderByEnum } from '@api/Blog';
import debounce from 'lodash.debounce';

// --- 검색 파라미터를 store에 반영하는 함수 ---
type ApplySearchParamsToStoreArgs = {
  searchParams: URLSearchParams;
  findCategorys: any[];
  findTags: any[];
  setTitle: (title: string) => void;
  setOrderBy: (orderBy: BlogOrderByEnum) => void;
  changeCategoryType: (value: string, type: FilterType) => void;
  changeTagType: (value: string, type: FilterType) => void;
  setIsFetching: (isFetching: boolean) => void;
};

function applySearchParamsToStore({
  searchParams,
  findCategorys,
  findTags,
  setTitle,
  setOrderBy,
  changeCategoryType,
  changeTagType,
  setIsFetching,
}: ApplySearchParamsToStoreArgs) {
  if (!searchParams) return;
  if (findCategorys.length === 0 || findTags.length === 0) return;

  const { findValueByChain } = FilterDropdownUtils;
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
    tagArray.forEach((value: string) => {
      changeTagType(value, type);
    });
  };

  setTitle(keyword || '');
  setOrderBy(
    orderBy === BlogOrderByEnum.Resent || orderBy === BlogOrderByEnum.Title
      ? (orderBy as BlogOrderByEnum)
      : BlogOrderByEnum.Resent,
  );

  categoryIn.forEach((element: string) => handleCategory(element, 'in'));
  categoryNotIn.forEach((element: string) => handleCategory(element, 'notIn'));
  tagIn.forEach((element: string) => handleTag(element, 'in'));
  tagNotIn.forEach((element: string) => handleTag(element, 'notIn'));

  setIsFetching(true);
}

// --- 검색 조건을 URL로 변환하는 함수 ---
type BuildSearchUrlArgs = {
  title: string;
  orderBy: BlogOrderByEnum;
  findCategorys: any[];
  findTags: any[];
};

function buildSearchUrl({ title, orderBy, findCategorys, findTags }: BuildSearchUrlArgs) {
  const stringParams: { [key: string]: string } = {
    keyword: title || '',
    tagIn: FilterDropdownUtils.getIns(findTags).toString(),
    tagNotIn: FilterDropdownUtils.getNotIns(findTags).toString(),
  };
  const arraryParams: { [key: string]: string[][] } = {
    categoryIn: FilterDropdownUtils.getInsChain(findCategorys),
    categoryNotIn: FilterDropdownUtils.getNotInsChain(findCategorys),
  };
  const params = new URLSearchParams();
  for (const key in stringParams) {
    if (stringParams[key]) params.append(key, stringParams[key]);
  }
  for (const key in arraryParams) {
    arraryParams[key].forEach((value: string[]) => {
      params.append(key, value.toString());
    });
  }
  if (orderBy !== BlogOrderByEnum.Resent) params.append('orderBy', orderBy.toString());
  return '/blog' + (params.size === 0 ? '' : '?' + params.toString());
}

const useBlogSearch = (category: BlogCategory[], tags: string[]) => {
  // --- store 및 훅 초기화 ---
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
  const titleDebounced = useDebounce(titleS, 1000);
  const hasFetchedFirstBlogs = useRef(false);
  const hasFetchedMenu = useRef(false);

  // --- 카테고리/태그 최초 세팅 ---
  useEffect(() => {
    if (hasFetchedMenu.current) return;
    hasFetchedMenu.current = true;
    setBlogCategorys(category);
    setBlogTags(tags);
  }, [setBlogCategorys, setBlogTags, category, tags]);

  // --- 최초 렌더링 시 검색 조건 store에 반영 ---
  useEffect(() => {
    if (hasFetchedFirstBlogs.current) return;
    if (!searchParams) return;
    if (findCategorys.length === 0 || findTags.length === 0) return;
    hasFetchedFirstBlogs.current = true;
    applySearchParamsToStore({
      searchParams,
      findCategorys,
      findTags,
      setTitle,
      setOrderBy,
      changeCategoryType,
      changeTagType,
      setIsFetching,
    });
  }, [
    searchParams,
    findCategorys,
    findTags,
    setTitle,
    setOrderBy,
    changeCategoryType,
    changeTagType,
    setIsFetching,
  ]);

  // --- getBlogList를 debounce로 감싼 함수 ---
  const debouncedGetBlogList = useCallback(
    debounce((reset: boolean) => {
      getBlogList(reset);
    }, 300),
    [getBlogList],
  );

  // --- 무한 스크롤 시 블로그 리스트 요청 ---
  useEffect(() => {
    if (!isFetching) return;
    debouncedGetBlogList(false);
  }, [debouncedGetBlogList, isFetching]);

  // --- 블로그 데이터 로딩 완료 시 무한스크롤 상태 해제 ---
  useEffect(() => {
    if (status === 'success') {
      setIsFetching(false);
    }
  }, [setIsFetching, status]);

  // --- 검색 조건 변경 시 URL 및 블로그 리스트 갱신 ---
  useEffect(() => {
    if (!hasFetchedFirstBlogs.current || titleDebounced === null) return;
    const url = buildSearchUrl({
      title: titleDebounced,
      orderBy,
      findCategorys,
      findTags,
    });
    if (prevPath === url) return;
    replace(url);
    if (prevPath !== null) debouncedGetBlogList(true);
    setPrevPath(url);
  }, [
    titleDebounced,
    orderBy,
    findCategorys,
    findTags,
    prevPath,
    replace,
    setPrevPath,
    debouncedGetBlogList,
  ]);

  return { blogs, status };
};

export default useBlogSearch;
