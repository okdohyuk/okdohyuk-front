import React from 'react';
import { NextPageContext } from 'next';

type BlogPageProps = {
  postId: string;
};

function BlogPage({ postId }: BlogPageProps) {
  return <div>{postId}</div>;
}

export async function getServerSideProps({ res, query }: NextPageContext) {
  if (!query || !query.id) return { notFound: true };
  if (!res) return { notFound: true };
  const { id } = query;

  return {
    props: {
      postId: id,
    },
  };
}

export default BlogPage;
