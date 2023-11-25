import { getServerSideSitemap } from 'next-sitemap';
import { GetServerSideProps } from 'next';
import axios from 'axios';
import { Blog } from '@api/Blog';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_URL}/api/blog/list?page=1&limit=100`,
    );
    if (!data) throw 'body is null';
    const blogs = data.blogs as Blog[];

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
