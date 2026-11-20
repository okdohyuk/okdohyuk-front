import React from 'react';
import Skeleton from '@components/basic/Skeleton';
import { BLOG_PANEL } from '@components/blog/interactiveStyles';

function Frame() {
  return (
    <article className={`${BLOG_PANEL} flex h-80 flex-col overflow-hidden md:h-96`}>
      <Skeleton className="relative h-40 w-full shrink-0 rounded-none md:h-44" />

      <div className="flex flex-1 flex-col p-4">
        {/* 제목: 최대 2줄. 둘째 줄은 짧게 두어 잘린 제목임을 암시 */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 rounded-sm" />
          <Skeleton className="h-4 w-3/5 rounded-sm" />
        </div>

        {/* 본문: 3줄 (line-clamp와 동일한 줄 수) */}
        <div className="mt-2 flex flex-col gap-2">
          <Skeleton className="h-3 rounded-sm" />
          <Skeleton className="h-3 rounded-sm" />
          <Skeleton className="h-3 w-2/3 rounded-sm" />
        </div>

        <Skeleton className="mt-auto h-3 w-20 rounded-sm" />
      </div>
    </article>
  );
}

export default Frame;
