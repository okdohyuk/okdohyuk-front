import React from 'react';
import { GetStaticPaths, GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Blog } from '@api/Blog';
import markdownUtils from '@utils/markdownUtils';
import { format } from 'date-fns';
import { withTranslation } from 'next-i18next';
import Opengraph from '@components/Basic/Opengraph';
import { blogApi } from '@api';
import MobileScreenWarpper from '~/components/Complex/Layouts/MobileScreenWarpper';
import Link from '@components/Basic/Link';
import MarkDown from '@components/Complex/MarkDown';

type BlogPageProps = {
  blog: Blog;
};

function BlogDetailPage({ blog }: BlogPageProps) {
  const { title, contents, createdAt, thumbnailImage } = blog;
  return (
    <>
      <Opengraph
        title={title}
        ogTitle={title}
        description={markdownUtils.removeMarkdown(contents).slice(0, 500) + '...'}
        image={thumbnailImage}
      />
      <MobileScreenWarpper>
        <article className="prose prose-zinc dark:prose-invert mb-16 max-w-full">
          <div className="mb-8">
            <h1 className={'t-t-1 t-basic-1 mb-4'}>{title}</h1>
            <div className="flex items-center gap-2 t-c-1 t-basic-3">
              <div>{format(new Date(createdAt || ''), 'yyyy-MM-dd')}</div>
              <Link href={'/blog/edit/' + blog.urlSlug}>수정</Link>
            </div>
          </div>
          <MarkDown contents={contents} />
        </article>
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
    const translations = await serverSideTranslations(locale as string, ['common', 'blog']);
    return {
      props: {
        ...translations,
        blog,
      },
    };
  } catch (e) {
    console.error('-> e', e);
    return { notFound: true };
  }
}

export default withTranslation(['common', 'blog'])(BlogDetailPage);
