import React from 'react';
import Skeleton from '@components/basic/Skeleton';
import { BLOG_GLASS_PANEL_SOFT } from '@components/blog/interactiveStyles';

function Discript() {
  return (
    <article
      className={`${BLOG_GLASS_PANEL_SOFT} flex gap-4 overflow-hidden p-3 md:min-h-[200px] md:gap-6 md:p-4`}
    >
      <Skeleton className="relative h-[108px] w-[108px] rounded-xl md:h-[196px] md:w-[196px]" />

      <div className="flex flex-col flex-1 text-left justify-start overflow-hidden">
        <Skeleton className="my-1 md:my-4" h={6} />
        <Skeleton h={16} />
        <Skeleton className="mt-auto md:mb-4" h={4} w={12} />
      </div>
    </article>
  );
}

export default Discript;
