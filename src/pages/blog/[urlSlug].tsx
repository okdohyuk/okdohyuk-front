import React from 'react';
import { NextPageContext } from 'next';

type BlogPageProps = {
  urlSlug: string;
};

function BlogPage({ urlSlug }: BlogPageProps) {
  return <div>{urlSlug}</div>;
}

export async function getServerSideProps({ res, query }: NextPageContext) {
  if (!query || !query.urlSlug) return { notFound: true };
  if (!res) return { notFound: true };
  const { urlSlug } = query;

  return {
    props: {
      urlSlug: urlSlug,
    },
  };
}

export default BlogPage;
