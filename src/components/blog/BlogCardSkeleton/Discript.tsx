import React from 'react';
import Skeleton from '@components/basic/Skeleton';
import { BLOG_PANEL } from '@components/blog/interactiveStyles';

function Discript() {
  return (
    <article className={`${BLOG_PANEL} flex gap-4 overflow-hidden p-3 md:gap-5 md:p-4`}>
      <Skeleton className="relative h-28 w-28 shrink-0 rounded-sm md:h-40 md:w-40 md:rounded-md" />

      <div className="flex min-w-0 flex-1 flex-col text-left">
        {/* 제목: 최대 2줄. 둘째 줄은 짧게 두어 잘린 제목임을 암시 */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 rounded-sm" />
          <Skeleton className="h-4 w-1/2 rounded-sm" />
        </div>

        {/* 본문: 모바일 2줄 / 데스크탑 3줄 (line-clamp와 동일한 줄 수) */}
        <div className="mt-2 flex flex-col gap-2">
          <Skeleton className="h-3 rounded-sm" />
          <Skeleton className="h-3 w-3/4 rounded-sm md:w-full" />
          <Skeleton className="hidden h-3 w-2/3 rounded-sm md:block" />
        </div>

        <Skeleton className="mt-auto h-3 w-20 rounded-sm" />
      </div>
    </article>
  );
}

export default Discript;
