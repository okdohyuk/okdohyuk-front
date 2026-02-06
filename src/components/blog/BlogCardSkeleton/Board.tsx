import React from 'react';
import Skeleton from '@components/basic/Skeleton';
import { BLOG_GLASS_PANEL_SOFT } from '@components/blog/interactiveStyles';

function Board() {
  const placeholderKeys = ['first', 'second', 'third'];

  return (
    <article className={`${BLOG_GLASS_PANEL_SOFT} flex items-center overflow-hidden p-2`}>
      <Skeleton className="flex shrink-0 rounded-lg" w={12} h={12} />

      <Skeleton className="ml-3" h={6} />

      <div className="ml-auto flex whitespace-nowrap overflow-hidden">
        {placeholderKeys.map((key) => (
          <Skeleton h={4} key={key} />
        ))}
      </div>
    </article>
  );
}

export default Board;
