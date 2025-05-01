import React from 'react';
import { Language } from '~/app/i18n/settings';
import BlogImpl from './impl';
import { getTranslations } from '~/app/i18n';
import { metadata } from '@libs/server/customMetadata';
import { blogApi } from '@api';
import { unstable_cache } from 'next/cache';
import { LanguageParams } from '~/app/[lng]/layout';

export const generateMetadata = async (props: {
  params: Promise<{ lng: Language }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const { lng } = params;

  const { t } = await getTranslations(lng, 'blog/index');
  const keyword = searchParams?.keyword;

  const title = keyword ? `${keyword} (${new Date().getFullYear()})` : t('openGraph.defaultTitle');
  const description = keyword
    ? t('openGraph.description', { title: keyword })
    : t('openGraph.defaultDescription');

  return metadata({
    title: title,
    description,
    language: lng,
  });
};

const getStaticProps = unstable_cache(
  async () => {
    const [{ data: category }, { data: tags }] = await Promise.all([
      blogApi.getBlogCategory(),
      blogApi.getBlogTag(),
    ]);

    return { category, tags };
  },
  ['blog-search'],
  { revalidate: 60 * 60 * 24 * 7, tags: ['blog-search'] },
);

export default async function BlogSearchPage(props: LanguageParams) {
  const params = await props.params;
  const { category, tags } = await getStaticProps();
  return <BlogImpl params={params} category={category} tags={tags} />;
}
