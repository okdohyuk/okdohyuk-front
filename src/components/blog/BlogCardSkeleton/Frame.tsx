import React from 'react';
import Skeleton from '@components/basic/Skeleton';
import { BLOG_GLASS_PANEL_SOFT } from '@components/blog/interactiveStyles';

function Frame() {
  return (
    <article className={`${BLOG_GLASS_PANEL_SOFT} flex h-80 flex-col overflow-hidden md:h-96`}>
      <Skeleton className="relative h-40 w-full md:h-44" />

      <div className="flex flex-1 flex-col p-4">
        {/* 제목: 모바일 1줄 / 데스크탑 최대 2줄. 둘째 줄은 짧게 두어 잘린 제목임을 암시 */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 rounded" />
          <Skeleton className="hidden h-4 w-3/5 rounded md:block" />
        </div>

        {/* 본문: 모바일 4줄 / 데스크탑 3줄 (line-clamp와 동일한 줄 수) */}
        <div className="mt-2 flex flex-col gap-2">
          <Skeleton className="h-3.5 rounded" />
          <Skeleton className="h-3.5 rounded" />
          <Skeleton className="h-3.5 w-4/5 rounded md:w-2/3" />
          <Skeleton className="h-3.5 w-2/5 rounded md:hidden" />
        </div>

        <Skeleton className="mt-auto h-3 w-16 rounded" />
      </div>
    </article>
  );
}

export default Frame;
