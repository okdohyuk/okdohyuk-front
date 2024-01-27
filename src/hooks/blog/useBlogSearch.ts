import { useEffect, useState } from 'react';
import useInfiniteScroll from '../useInfiniteScroll';
import useStore from '../useStore';
import { useRouter } from 'next/router';
import FilterDropdownUtils from '~/utils/filterDropdownUtil';
import { BlogCategory, BlogSearchResponce } from '~/spec/api/Blog';
import { FilterType } from '~/components/complex/FilterDropdown/type';
import useDebounce from '../useDebounce';
import { ParsedUrlQuery } from 'querystring';

const useBlogSearch = (
  initCategorys: BlogCategory[],
  initTags: string[],
  query: ParsedUrlQuery,
  initData: BlogSearchResponce,
) => {
  const {
    blogs,
    getBlogList,
    status,
    setBlogCategorys,
    setBlogTags,
    categorys: findCategorys,
    tags: findTags,
    orderBy,
    title: titleS,
    setBlogList,
    setOrderBy,
    setTitle,
    changeTagType,
    changeCategoryType,
    prevPath,
    setPrevPath,
  } = useStore('blogSearchStore');
  const { setIsFetching, isFetching } = useInfiniteScroll();
  const { replace } = useRouter();
  const [isFirst, setIsFirst] = useState(true);
  const titleD = useDebounce(titleS, 1000);

  useEffect(() => {
    setBlogCategorys(initCategorys);
    setBlogTags(initTags);
    setBlogList(initData);
  }, [initCategorys, initTags, initData, setBlogCategorys, setBlogTags, setBlogList]);

  // 최초 렌더링 시 검색 조건 적용
  useEffect(() => {
    if (findCategorys.length === 0 || findTags.length === 0) return;
    if (!isFirst) return;

    const { findValueByChain } = FilterDropdownUtils;
    const { orderBy, keyword, categoryIn, categoryNotIn, tagIn, tagNotIn } = query;

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

    if (keyword && typeof keyword === 'string') {
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
  }, [
    query,
    findCategorys,
    findTags,
    isFirst,
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
    if (isFirst || titleD === null) return;

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
    replace(url, url, { shallow: true });
    if (prevPath !== null) getBlogList(true);
    setPrevPath(url);
  }, [
    titleD,
    orderBy,
    findCategorys,
    findTags,
    isFirst,
    prevPath,
    replace,
    setPrevPath,
    getBlogList,
  ]);

  return { blogs, status };
};

export default useBlogSearch;
