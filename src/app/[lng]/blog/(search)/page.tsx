import React from 'react';
import { unstable_cache } from 'next/cache';
import { blogApi } from '@api';
import { metadata } from '@libs/server/customMetadata';
import { getTranslations } from '~/app/i18n';
import { Language } from '~/app/i18n/settings';
import { LanguageParams } from '~/app/[lng]/layout';
import BlogImpl from './impl';

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
    title,
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

export default async function BlogSearchPage({ params }: LanguageParams) {
  const { lng } = await params;
  const { category, tags } = await getStaticProps();
  return <BlogImpl lng={lng} category={category} tags={tags} />;
}
