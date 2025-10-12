import React from 'react';
import Skeleton from '@components/basic/Skeleton';

function Board() {
  const placeholderKeys = ['first', 'second', 'third'];

  return (
    <article className="flex items-center p-1 rounded-md overflow-hidden bg-basic-3">
      <Skeleton className="flex shrink-0" w={12} h={12} />

      <Skeleton h={6} />

      <div className="ml-auto flex whitespace-nowrap overflow-hidden">
        {placeholderKeys.map((key) => (
          <Skeleton h={4} key={key} />
        ))}
      </div>
    </article>
  );
}

export default Board;
