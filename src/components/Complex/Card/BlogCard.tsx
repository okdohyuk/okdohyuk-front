import React from 'react';
import { Blog } from '@assets/type';
import Image from 'next/image';
import Link from '@components/Basic/Link';
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
          'md:min-h-[200px] flex p-2 rounded bg-zinc-300 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 gap-6 overflow-hidden'
        }
      >
        <div className={'relative'}>
          {thumbnailImage ? (
            <div className={'w-[100px] h-[100px] md:w-[200px] md:h-[200px] relative'}>
              <Image
                src={`${process.env.NEXT_PUBLIC_URL}${thumbnailImage}`}
                alt={title}
                layout={'fill'}
                objectFit={'cover'}
              />
            </div>
          ) : null}
        </div>
        <div
          className={
            'flex flex-col flex-1 text-left justify-center md:justify-start md:pt-6 gap-6 overflow-hidden'
          }
        >
          <h2
            className={
              'text-md md:text-xl font-bold text-black dark:text-white line-clamp-1 md:line-clamp-2'
            }
          >
            {title}
          </h2>
          <div
            className={'text-sm md:text-md text-black dark:text-white line-clamp-2 md:line-clamp-3'}
          >
            {markdownUtils.removeMarkdown(contents)}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default BlogCard;
