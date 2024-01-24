import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { GetStaticPropsContext } from 'next';
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
import { BlogCategory } from '@api/Blog';

type BlogPageProps = {
  categorys: BlogCategory[];
  tags: string[];
};

type BlogPageFC = React.FC<BlogPageProps>;

const BlogPage: BlogPageFC = ({ categorys, tags }) => {
  const { t } = useTranslation('blog/index');
  const {} = useBlogSearch(categorys, tags);
  const [isOpen, setIsOpen] = useState(false);
  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  return (
    <>
      <Opengraph
        title={t('openGraph.title')}
        ogTitle={t('openGraph.ogTitle')}
        description={t('openGraph.description')}
        isAds
      />
      <AsideScreenWrapper left={<BlogSearchNav hasMargin />}>
        <h1 className={'t-t-1 t-basic-1 mb-4'}>{t('title')}</h1>
        <BlogSearchBar toggleDrawer={toggleDrawer} />
        <BlogSearchList />
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

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => {
  try {
    const { data: categorys } = await blogApi.getBlogCategory();
    const { data: tags } = await blogApi.getBlogTag();

    return {
      props: {
        ...(await serverSideTranslations(locale as string, ['common', 'blog/index'])),
        categorys,
        tags,
        revalidate: 1000,
      },
    };
  } catch (e) {
    return { notFound: true };
  }
};

export default observer(BlogPage);
