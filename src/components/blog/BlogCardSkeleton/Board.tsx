import React from 'react';
import Skeleton from '@components/basic/Skeleton';
import { BLOG_PANEL } from '@components/blog/interactiveStyles';

function Board() {
  const placeholderKeys = ['first', 'second', 'third'];

  return (
    <article className={`${BLOG_PANEL} flex min-h-16 items-center gap-3 overflow-hidden p-2`}>
      <Skeleton className="flex shrink-0 rounded-md" w={12} h={12} />

      <Skeleton className="flex-1" h={4} />

      <div className="ml-auto flex gap-1 overflow-hidden whitespace-nowrap">
        {placeholderKeys.map((key) => (
          <Skeleton className="w-10 rounded-sm" h={5} key={key} />
        ))}
      </div>
    </article>
  );
}

export default Board;
