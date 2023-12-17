import React from 'react';
import { format } from 'date-fns';
import { BlogComponent } from './type';
import Link from '@components/Basic/Link';

const BlogHeader: BlogComponent = ({ blog }) => {
  const { thumbnailImage, title, createdAt, urlSlug } = blog;
  return (
    <div className="h-60">
      <header className="w-full h-64 absolute top-0 left-0 before:content-[''] before:z-0 before:bg-black before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:opacity-40">
        {thumbnailImage ? (
          <img
            src={`${process.env.NEXT_PUBLIC_WORKER_URL}${thumbnailImage}`}
            alt={title}
            className="w-full h-64 object-cover my-0"
          />
        ) : null}
        <div className="absolute flex flex-col justify-center w-full h-full p-10 top-0 left-0 z-10">
          <h1 className={'t-t-1 text-white mb-4 line-clamp-2'}>{title}</h1>
          <div className="flex items-center gap-2 t-c-1 text-white">
            <div>{format(new Date(createdAt || ''), 'yyyy-MM-dd')}</div>
            <Link href={'/blog/edit/' + urlSlug}>수정</Link>
          </div>
        </div>
      </header>
    </div>
  );
};

export default BlogHeader;
