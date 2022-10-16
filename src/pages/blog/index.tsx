import React from 'react';
import Opengraph from '@components/opengraph';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Blog } from '@assets/type';
import axios from 'axios';

type BlogPageProps = {
  initialBlogs: Blog[];
};

function BlogPage({ initialBlogs }: BlogPageProps) {
  const { t } = useTranslation('blog');
  console.log('-> initialBlogs', initialBlogs);

  return (
    <div className={'w-full min-h-screen dark:bg-black pb-[70px] lg:pb-auto'}>
      <Opengraph
        title={t('openGraph.title')}
        ogTitle={t('openGraph.ogTitle')}
        description={t('openGraph.description')}
      />
      <div className="flex flex-col items-center gap-6 text-center px-4 py-12 lg:py-24">
        <h1
          className={
            'font-bold text-2xl max-w-md md:text-3xl lg:text-5xl lg:max-w-2xl dark:text-white'
          }
        >
          {t('title')}
        </h1>
      </div>
    </div>
  );
}

export async function getServerSideProps({ locale, req }: NextPageContext) {
  if (!req) return { notFound: true };
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const baseUrl = req ? `${protocol}://${req.headers.host}` : '';
  try {
    const { data } = await axios.get(baseUrl + '/api/blog/list?page=1&limit=5');
    if (!data) throw 'body is null';
    console.log('-> body.blogs', data);
    return {
      props: {
        ...(await serverSideTranslations(locale ? locale : '', ['common', 'blog'])),
        initialBlogs: data.blogs,
      },
    };
  } catch (e) {
    console.error('-> e', e);
    return { notFound: true };
  }
}

export default BlogPage;
