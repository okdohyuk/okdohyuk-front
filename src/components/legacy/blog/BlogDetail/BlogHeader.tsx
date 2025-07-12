import React from 'react';
import { format } from 'date-fns';
import Link from '@components/basic/Link';
import { useBlogDetail } from './BlogDetailProvider';

const BlogHeader: React.FC = () => {
  const { blog } = useBlogDetail();
  const { thumbnailImage, title, createdAt, urlSlug, categoryChain } = blog;

  const categoryRender = (category: string, index: number) => {
    return (
      <React.Fragment key={index}>
        {index !== 0 ? <span>{'>'}</span> : null}
        <Link
          href={'/blog?categoryIn=' + categoryChain.slice(0, index + 1).toString()}
          className="cursor-pointer hover:underline"
        >
          {category}
        </Link>
      </React.Fragment>
    );
  };

  return (
    <div className="h-60">
      <header className="w-full h-64 absolute top-0 left-0 before:content-[''] before:z-0 before:bg-black before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:opacity-40">
        {thumbnailImage ? (
          <img
            src={thumbnailImage + '?w=1280'}
            alt={title}
            className="w-full h-64 object-cover my-0"
          />
        ) : null}
        <div className="absolute flex flex-col justify-center w-full h-full p-6 md:p-10 top-0 left-0 z-10">
          <div className="flex items-center gap-2 t-d-3 text-white mb-2">
            {categoryChain ? categoryChain.map(categoryRender) : null}
          </div>
          <h1 className={'t-t-3 lg:t-t-1 text-white mb-4'}>{title}</h1>
          <div className="flex items-center gap-2 t-c-1 text-zinc-300">
            <div>{format(createdAt ? new Date(createdAt || '') : new Date(), 'yyyy-MM-dd')}</div>
            <Link href={'/admin/blog/write?urlSlug=' + urlSlug}>수정</Link>
          </div>
        </div>
      </header>
    </div>
  );
};

export default BlogHeader;
