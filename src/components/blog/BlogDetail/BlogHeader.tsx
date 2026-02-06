import React from 'react';
import { format } from 'date-fns';
import Image from 'next/legacy/image';
import Link from '@components/basic/Link';
import { useBlogDetail } from 'components/blog/BlogDetail/BlogDetailProvider';
import { H1, Text } from '@components/basic/Text';
import { BLOG_GLASS_PANEL } from '@components/blog/interactiveStyles';
import ViewCount from './ViewCount';

function BlogHeader() {
  const { blog } = useBlogDetail();
  const { thumbnailImage, title, createdAt, urlSlug, categoryChain } = blog;
  const createdDate = createdAt ? new Date(createdAt) : new Date();

  const categoryRender = (category: string, index: number) => (
    <Link
      key={category}
      href={`/blog?categoryIn=${categoryChain.slice(0, index + 1).join(',')}`}
      className="rounded-full border border-white/25 bg-black/25 px-3 py-1 text-xs font-semibold text-zinc-100 backdrop-blur-sm transition-colors hover:border-point-2/80 hover:text-white"
    >
      {category}
    </Link>
  );

  return (
    <header className={`${BLOG_GLASS_PANEL} relative mb-6 min-h-[260px] overflow-hidden`}>
      {thumbnailImage ? (
        <Image
          src={`${thumbnailImage}?w=1280`}
          alt={title}
          layout="fill"
          objectFit="cover"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-point-2/40 via-violet-500/25 to-cyan-500/20 dark:from-point-1/30 dark:via-violet-800/20 dark:to-cyan-800/20" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/55 to-black/35" />
      <div className="relative z-10 flex min-h-[260px] flex-col justify-end p-6 md:p-10">
        <Text className="mb-3 flex flex-wrap items-center gap-2 text-white" variant="d3">
          {categoryChain ? categoryChain.map(categoryRender) : null}
        </Text>
        <H1 className="mb-4 text-2xl text-white lg:text-4xl">{title}</H1>
        <Text className="flex flex-wrap items-center gap-3 text-zinc-300" variant="c1">
          <span className="inline-flex items-center rounded-full bg-black/30 px-3 py-1">
            {format(createdDate, 'yyyy-MM-dd')}
          </span>
          <span className="inline-flex items-center rounded-full bg-black/30 px-3 py-1">
            <ViewCount />
          </span>
          <Link
            href={`/admin/blog/write?urlSlug=${urlSlug}`}
            className="rounded-full border border-white/25 bg-black/25 px-3 py-1 text-zinc-200 transition-colors hover:border-point-2/80 hover:text-white"
          >
            수정
          </Link>
        </Text>
      </div>
    </header>
  );
}

export default BlogHeader;
