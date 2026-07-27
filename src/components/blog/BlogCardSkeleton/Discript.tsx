import React from 'react';
import Skeleton from '@components/basic/Skeleton';
import { BLOG_GLASS_PANEL_SOFT } from '@components/blog/interactiveStyles';

function Discript() {
  return (
    <article
      className={`${BLOG_GLASS_PANEL_SOFT} flex gap-4 overflow-hidden p-3 md:min-h-[200px] md:gap-6 md:p-4`}
    >
      <Skeleton className="relative h-[108px] w-[108px] shrink-0 rounded-xl md:h-[196px] md:w-[196px]" />

      <div className="flex flex-1 flex-col justify-start overflow-hidden text-left">
        {/* 제목: 모바일 1줄 / 데스크탑 최대 2줄. 둘째 줄은 짧게 두어 잘린 제목임을 암시 */}
        <div className="my-1 flex flex-col gap-2 md:my-3">
          <Skeleton className="h-4 rounded" />
          <Skeleton className="hidden h-4 w-1/2 rounded md:block" />
        </div>

        {/* 본문: 모바일 2줄 / 데스크탑 3줄 (line-clamp와 동일한 줄 수) */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 rounded" />
          <Skeleton className="h-3.5 w-3/4 rounded md:w-full" />
          <Skeleton className="hidden h-3.5 w-2/3 rounded md:block" />
        </div>

        <Skeleton className="mt-auto h-3 w-16 rounded md:mb-1" />
      </div>
    </article>
  );
}

export default Discript;
