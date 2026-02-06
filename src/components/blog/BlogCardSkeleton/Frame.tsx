import React from 'react';
import Skeleton from '@components/basic/Skeleton';
import { BLOG_GLASS_PANEL_SOFT } from '@components/blog/interactiveStyles';

function Frame() {
  return (
    <article className={`${BLOG_GLASS_PANEL_SOFT} flex h-80 flex-col overflow-hidden md:h-96`}>
      <Skeleton className="relative h-40 w-full md:h-44" />

      <div className="flex flex-col flex-1 p-4">
        <Skeleton h={6} />
        <Skeleton className="mt-2" h={16} />
        <Skeleton className="mt-auto" h={4} w={12} />
      </div>
    </article>
  );
}

export default Frame;
