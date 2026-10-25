import { getServerSideSitemap, ISitemapField } from 'next-sitemap';
import { notFound } from 'next/navigation';
import { fetchAllPublicBlogs, toSafeIsoDate } from '@libs/server/blogFeedUtils';
import { SITE_URL } from '@libs/shared/agentDiscovery';
import { fallbackLng, languages } from '~/app/i18n/settings';

export const GET = async () => {
  try {
    const blogs = await fetchAllPublicBlogs();

    const fields: ISitemapField[] = blogs.map((blog) => {
      const createdIso = toSafeIsoDate(blog.createdAt);
      const lastmod = toSafeIsoDate(blog.updatedAt || blog.createdAt, createdIso);

      return {
        loc: `${SITE_URL}/${fallbackLng}/blog/${blog.urlSlug}`,
        lastmod,
        alternateRefs: languages.map((lng) => ({
          href: `${SITE_URL}/${lng}/blog/${blog.urlSlug}`,
          hreflang: lng,
        })),
      };
    });

    return await getServerSideSitemap(fields);
  } catch (error) {
    return notFound();
  }
};
