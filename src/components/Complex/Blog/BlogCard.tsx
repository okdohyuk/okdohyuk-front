import React from 'react';
import { Blog } from '@api/Blog';
import Image from 'next/image';
import Link from '@components/Basic/Link';
import markdownUtils from '@utils/markdownUtils';
import ClassName from '~/utils/classNameUtils';

type BlogCardProps = {
  blog: Blog;
  isAdmin?: boolean;
};

function BlogCard({ blog, isAdmin }: BlogCardProps) {
  const { thumbnailImage, title, contents, urlSlug, isPublic } = blog;
  const { cls } = ClassName;

  const link = isAdmin ? '/blog/write?urlSlug=' + urlSlug : '/blog/' + urlSlug;

  return (
    <Link href={link}>
      <article
        className={cls(
          'md:min-h-[200px] flex p-2 rounded-md gap-6 overflow-hidden',
          isPublic ? 'bg-basic-3 hover:bg-basic-4' : 'bg-red-100',
        )}
      >
        <div className={'relative'}>
          {thumbnailImage ? (
            <div className={'w-[100px] h-[100px] md:w-[200px] md:h-[200px] relative'}>
              <Image src={thumbnailImage} alt={title} layout={'fill'} objectFit={'cover'} />
            </div>
          ) : null}
        </div>
        <div
          className={
            'flex flex-col flex-1 text-left justify-center md:justify-start md:pt-6 gap-6 overflow-hidden'
          }
        >
          <h2 className={'t-d-1 t-basic-1 line-clamp-1 md:line-clamp-2'}>{title}</h2>
          <div className={'t-d-3 t-basic-1 line-clamp-2 md:line-clamp-3'}>
            {markdownUtils.removeMarkdown(contents)}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default BlogCard;