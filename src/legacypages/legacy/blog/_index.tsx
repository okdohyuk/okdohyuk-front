import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { observer } from 'mobx-react';
import Opengraph from '@components/legacy/basic/Opengraph';
import useBlogSearch from '@hooks/blog/useBlogSearch';
import AsideScreenWrapper from '@components/complex/Layout/AsideScreenWrapper';
import BlogSearchNav from '@components/legacy/blog/BlogSearchNav';
import BlogSearchList from '@components/legacy/blog/BlogSearchList';
import BlogSearchBar from '@components/legacy/blog/BlogSearchBar';
import Drawer from 'react-modern-drawer';

import 'react-modern-drawer/dist/index.css';
import { blogApi } from '@api';
import { BlogCategory, BlogOrderByEnum, BlogSearchResponce } from '@api/Blog';
import { ParsedUrlQuery } from 'querystring';
import { FilterType } from '@components/complex/FilterDropdown/type';
import BlogUtils from '@utils/blogUtils';
import { unstable_cache } from 'next/cache';

type BlogPageProps = {
  category: BlogCategory[];
  tags: string[];
  keyword: string | null;
  query: ParsedUrlQuery;
  initData: BlogSearchResponce;
};

type BlogPageFC = React.FC<BlogPageProps>;

const BlogPage: BlogPageFC = ({ category, tags, keyword, query, initData }) => {
  const { t } = useTranslation('blog/index');
  const {} = useBlogSearch(category, tags, query, initData);
  const [isOpen, setIsOpen] = useState(false);
  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  const OGTitle =
    keyword !== null ? `${keyword} (${new Date().getFullYear()})` : t('openGraph.defaultTitle');
  const OGDescription =
    keyword !== null
      ? t('openGraph.description').replace('{title}', keyword)
      : t('openGraph.defaultDescription');

  return (
    <>
      <Opengraph title={OGTitle} ogTitle={OGTitle} description={OGDescription} isAds />
      <AsideScreenWrapper left={<BlogSearchNav hasMargin />}>
        <h1 className={'t-t-1 t-basic-1 mb-4'}>{t('title')}</h1>
        <BlogSearchBar toggleDrawer={toggleDrawer} />
        <BlogSearchList initData={initData} />
      </AsideScreenWrapper>
      <Drawer
        open={isOpen}
        onClose={toggleDrawer}
        direction="right"
        className="!bg-zinc-100 dark:!bg-zinc-800"
      >
        <BlogSearchNav />
      </Drawer>
    </>
  );
};

export const getServerSideProps = async ({ locale, query }: GetServerSidePropsContext) => {
  try {
    const fetchCategorys = unstable_cache(
      async () => {
        const { data: category } = await blogApi.getBlogCategory();
        return category;
      },
      ['category'],
      { revalidate: 60 },
    );

    const fetchTags = unstable_cache(
      async () => {
        const { data: tags } = await blogApi.getBlogTag();
        return tags;
      },
      ['tags'],
      { revalidate: 60 },
    );

    const fetchInitData = async () => {
      const { orderBy, keyword, categoryIn, categoryNotIn, tagIn, tagNotIn } = query;
      let reqTitle: string | null = null;
      let reqOrderBy: BlogOrderByEnum = 'RESENT';
      const reqCategoryIn: string[] = [];
      const reqCategoryNotIn: string[] = [];
      let reqTagIn: string[] | undefined;
      let reqTagNotIn: string[] | undefined;

      const handleCategory = (category: string, type: FilterType) => {
        const categoryChain = category.split(',');
        // @ts-ignore
        const categoryValue = BlogUtils.findIdByCategoryChain(categoryChain, category);
        if (type === 'in' && categoryValue) {
          reqCategoryIn.push(categoryValue);
        } else if (type === 'notIn' && categoryValue) {
          reqCategoryNotIn.push(categoryValue);
        }
      };

      const handleTag = (tag: string, type: FilterType) => {
        const tagArray = tag.split(',');
        if (type === 'in') {
          reqTagIn = tagArray;
        } else if (type === 'notIn') {
          reqTagNotIn = tagArray;
        }
      };

      if (keyword && typeof keyword === 'string') {
        reqTitle = keyword;
      }

      if (orderBy === 'RESENT' || orderBy === 'TITLE') {
        reqOrderBy = orderBy;
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

      const { data: initData } = await blogApi.getBlogSearch(
        0,
        10,
        reqCategoryIn,
        reqCategoryNotIn,
        reqTitle ? reqTitle : undefined,
        reqTagIn,
        reqTagNotIn,
        reqOrderBy,
      );

      return initData;
    };

    const [category, tags, initData] = await Promise.all([
      fetchCategorys(),
      fetchTags(),
      fetchInitData(),
    ]);

    return {
      props: {
        ...(await serverSideTranslations(locale ? locale : 'ko', ['common', 'blog/index'])),
        category,
        tags,
        keyword: query.keyword || null,
        query,
        initData,
      },
    };
  } catch (e) {
    return { notFound: true };
  }
};

export default observer(BlogPage);
