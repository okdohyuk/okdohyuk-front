import React from 'react';
import { GetStaticPaths, GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Blog } from '@api/Blog';
import markdownUtils from '@utils/markdownUtils';
import { withTranslation } from 'next-i18next';
import Opengraph from '@components/Basic/Opengraph';
import { blogApi } from '@api';
import MobileScreenWarpper from '~/components/Complex/Layouts/MobileScreenWarpper';
import BlogPost from '@components/Complex/Blog';

type BlogPageProps = {
  blog: Blog;
};

function BlogDetailPage({ blog }: BlogPageProps) {
  const { title, contents, thumbnailImage } = blog;
  return (
    <>
      <Opengraph
        title={title}
        ogTitle={title}
        description={markdownUtils.removeMarkdown(contents).slice(0, 155) + '..'}
        image={thumbnailImage}
      />
      <MobileScreenWarpper>
        <BlogPost blog={blog} />
      </MobileScreenWarpper>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data: blogs } = await blogApi.getBlogList(0, 1000);
  const paths = blogs.map((blog) => ({ params: { urlSlug: blog.urlSlug } }));

  return { paths, fallback: 'blocking' };
};

export async function getStaticProps({ params, locale }: GetStaticPropsContext) {
  if (!(params && params.urlSlug)) return { notFound: true };
  const { urlSlug } = params;
  try {
    const { data: blog } = await blogApi.getBlogUrlSlug(urlSlug + '');
    const translations = await serverSideTranslations(locale as string, ['common']);
    return {
      props: {
        ...translations,
        blog,
        revalidate: 60,
      },
    };
  } catch (e) {
    console.error('-> e', e);
    return { notFound: true };
  }
}

export default withTranslation(['common'])(BlogDetailPage);
