import React from 'react';
import Image from 'next/image';
import { cn } from '@utils/cn';
import MarkdownUtils from '@utils/markdownUtils';
import { BLOG_CARD } from '@components/blog/interactiveStyles';
import CardMeta from './CardMeta';
import ThumbPlaceholder from './ThumbPlaceholder';
import { BlogCardTypeFC } from './type';

const Discript: BlogCardTypeFC = function Discript({ blog }) {
  const { thumbnailImage, title, contents, createdAt, tags } = blog;

  return (
    <article className={cn(BLOG_CARD, 'flex gap-4 overflow-hidden p-3 md:gap-5 md:p-4')}>
      {/* card 16px − padding 12/16px → inner radius 4/8px (min 4) */}
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-sm border border-basic-3 md:h-40 md:w-40 md:rounded-md">
        {thumbnailImage ? (
          <Image
            src={`${thumbnailImage}?w=640`}
            alt=""
            fill
            sizes="(max-width: 768px) 112px, 160px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <ThumbPlaceholder title={title} />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col text-left">
        <h2 className="line-clamp-2 text-base font-medium leading-snug text-fg-1 md:text-lg">
          {title}
        </h2>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-fg-4 md:mt-2 md:line-clamp-3">
          {MarkdownUtils.removeMarkdown(contents)}
        </p>
        <CardMeta createdAt={createdAt} tags={tags} className="mt-auto pt-3" />
      </div>
    </article>
  );
};

export default Discript;
