import React from 'react';
import Skeleton from '@components/basic/Skeleton';

const Board = () => {
  return (
    <article className={'flex items-center p-1 rounded-md overflow-hidden bg-basic-3'}>
      <Skeleton className="flex shrink-0" w={12} h={12} />

      <Skeleton h={6} />

      <div className="ml-auto flex whitespace-nowrap overflow-hidden">
        {[...new Array(3)].map((d, i) => (
          <Skeleton h={4} key={i} />
        ))}
      </div>
    </article>
  );
};

export default Board;
