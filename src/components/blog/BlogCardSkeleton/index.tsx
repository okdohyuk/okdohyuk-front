import React from 'react';
import Board from './Board';
import Discript from './Discript';
import Frame from './Frame';
import { BlogCardSkeletonFC } from './type';

const BlogCardSkeleton: BlogCardSkeletonFC = function BlogCardSkeleton({ type = 'discript' }) {
  return (
    <div>
      {
        {
          discript: <Discript />,
          frame: <Frame />,
          board: <Board />,
        }[type]
      }
    </div>
  );
};

export default BlogCardSkeleton;
