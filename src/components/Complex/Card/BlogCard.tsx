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
          'md:min-h-[200px] flex p-2 rounded-md bg-basic-3 hover:bg-basic-4 gap-6 overflow-hidden'
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
