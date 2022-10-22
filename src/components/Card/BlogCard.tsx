import React from 'react';
import { Blog } from '@assets/type';
import Image from 'next/image';
import Link from '@components/Link';
import markdownUtils from '@utils/markdownUtils';

type BlogCardProps = {
  blog: Blog;
};

function BlogCard({ blog }: BlogCardProps) {
  const { thumbnailImage, title, contents, urlSlug } = blog;

  return (
    <Link href={'/blog/' + urlSlug}>
      <article
        className={
          'flex p-2 rounded bg-zinc-300 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }
      >
        <div className={'relative'}>
          {thumbnailImage ? (
            <Image
              src={'http://localhost:3000' + thumbnailImage}
              width={200}
              height={200}
              objectFit={'cover'}
            />
          ) : (
            <div className={'w-[200px] h-[200px]'} />
          )}
        </div>
        <div className={'flex flex-col flex-1 text-left justify-start gap-6 p-10'}>
          <h2 className={'text-xl font-bold text-black dark:text-white'}>{title}</h2>
          <div className={'text-black dark:text-white line-clamp-3'}>
            {markdownUtils.removeMarkdown(contents)}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default BlogCard;
