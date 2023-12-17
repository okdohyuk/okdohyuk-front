import { getServerSideSitemap } from 'next-sitemap';
import { GetServerSideProps } from 'next';
import { blogApi } from '~/spec/api';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const { data: blogs } = await blogApi.getBlogList(0, 1000);

    const newsSitemaps = blogs.map((blog) => ({
      loc: `${process.env.NEXT_PUBLIC_URL}/blog/${blog.urlSlug}`,
      lastmod: new Date().toISOString(),
    }));

    const fields = [...newsSitemaps];

    return getServerSideSitemap(ctx, fields);
  } catch (e) {
    console.error('-> e', e);
    return { notFound: true };
  }
};

export default function Site() {
  return;
}
