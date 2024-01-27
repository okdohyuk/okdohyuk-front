import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { observer } from 'mobx-react';
import Opengraph from '@components/basic/Opengraph';
import useBlogSearch from '@hooks/blog/useBlogSearch';
import AsideScreenWrapper from '@components/complex/Layout/AsideScreenWrapper';
import BlogSearchNav from '@components/blog/BlogSearchNav';
import BlogSearchList from '@components/blog/BlogSearchList';
import BlogSearchBar from '@components/blog/BlogSearchBar';
import Drawer from 'react-modern-drawer';

import 'react-modern-drawer/dist/index.css';
import { blogApi } from '@api';
import { BlogCategory, BlogOrderByEnum, BlogSearchResponce } from '@api/Blog';
import { ParsedUrlQuery } from 'querystring';
import { FilterType } from '~/components/complex/FilterDropdown/type';
import BlogUtils from '~/utils/blogUtils';

type BlogPageProps = {
  categorys: BlogCategory[];
  tags: string[];
  title: string | null;
  query: ParsedUrlQuery;
  initData: BlogSearchResponce;
};

type BlogPageFC = React.FC<BlogPageProps>;

const BlogPage: BlogPageFC = ({ categorys, tags, title, query, initData }) => {
  const { t } = useTranslation('blog/index');
  const {} = useBlogSearch(categorys, tags, query, initData);
  const [isOpen, setIsOpen] = useState(false);
  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  const OGTitle =
    title !== null ? `${title} (${new Date().getFullYear()})` : t('openGraph.defaultTitle');
  const OGDescription =
    title !== null
      ? t('openGraph.description').replace('{title}', title)
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
    const { data: categorys } = await blogApi.getBlogCategory();
    const { data: tags } = await blogApi.getBlogTag();

    const { orderBy, title, categoryIn, categoryNotIn, tagIn, tagNotIn } = query;
    let reqTitle: string | null = null;
    let reqOrderBy: BlogOrderByEnum = 'RESENT';
    const reqCategoryIn: string[] = [];
    const reqCategoryNotIn: string[] = [];
    let reqTagIn: string[] | undefined;
    let reqTagNotIn: string[] | undefined;

    const handleCategory = (category: string, type: FilterType) => {
      const categoryChain = category.split(',');
      const categoryValue = BlogUtils.findIdByCategoryChain(categoryChain, categorys);
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

    if (title && typeof title === 'string') {
      reqTitle = title;
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

    return {
      props: {
        ...(await serverSideTranslations(locale ? locale : 'ko', ['common', 'blog/index'])),
        categorys,
        tags,
        title: reqTitle,
        query,
        initData,
      },
    };
  } catch (e) {
    return { notFound: true };
  }
};

export default observer(BlogPage);
