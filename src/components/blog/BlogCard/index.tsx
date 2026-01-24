import React from 'react';
import Link from '@components/basic/Link';
import Board from './Board';
import Discript from './Discript';
import Frame from './Frame';
import { BlogCardFC } from './type';

const BlogCard: BlogCardFC = function BlogCard({ blog, isAdmin = false, type = 'discript' }) {
  const { urlSlug } = blog;
  const link = isAdmin ? `/admin/blog/write?urlSlug=${urlSlug}` : `/blog/${urlSlug}`;

  return (
    <Link href={link}>
      {
        {
          discript: <Discript blog={blog} />,
          frame: <Frame blog={blog} />,
          board: <Board blog={blog} />,
        }[type]
      }
    </Link>
  );
};

export default BlogCard;
