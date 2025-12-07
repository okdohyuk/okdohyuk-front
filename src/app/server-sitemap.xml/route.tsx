import { getServerSideSitemap } from 'next-sitemap';
import { blogApi } from '@api';
import { notFound } from 'next/navigation';

export const GET = async () => {
  try {
    const { data } = await blogApi.getBlogSearch(0, 100);

    const newsSitemaps = data.results.map((blog) => ({
      loc: `${process.env.NEXT_PUBLIC_URL}/blog/${blog.urlSlug}`,
      lastmod: new Date().toISOString(),
    }));

    const fields = [...newsSitemaps];

    return await getServerSideSitemap(fields);
  } catch (error) {
    return notFound();
  }
};
