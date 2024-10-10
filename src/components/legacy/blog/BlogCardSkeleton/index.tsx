import React from 'react';
import { BlogCardSkeletonFC } from './type';
import Discript from './Discript';
import Frame from './Frame';
import Board from './Board';

const BlogCardSkeleton: BlogCardSkeletonFC = ({ type = 'discript' }) => {
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
