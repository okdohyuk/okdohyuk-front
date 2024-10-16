import { getServerSideSitemapLegacy } from 'next-sitemap';
import { GetServerSideProps } from 'next';
import { blogApi } from '@api';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const { data: res } = await blogApi.getBlogSearch(0, 100);

    const newsSitemaps = res.results.map((blog) => ({
      loc: `${process.env.NEXT_PUBLIC_URL}/blog/${blog.urlSlug}`,
      lastmod: new Date().toISOString(),
    }));

    const fields = [...newsSitemaps];

    return getServerSideSitemapLegacy(ctx, fields);
  } catch (e) {
    console.error('-> e', e);
    return { notFound: true };
  }
};

export default function Site() {
  return;
}
