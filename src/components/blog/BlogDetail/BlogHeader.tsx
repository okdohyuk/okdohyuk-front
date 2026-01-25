import React from 'react';
import { format } from 'date-fns';
import Link from '@components/basic/Link';
import { useBlogDetail } from 'components/blog/BlogDetail/BlogDetailProvider';
import { H1, Text } from '@components/basic/Text';
import ViewCount from './ViewCount';

function BlogHeader() {
  const { blog } = useBlogDetail();
  const { thumbnailImage, title, createdAt, urlSlug, categoryChain } = blog;
  const createdDate = createdAt ? new Date(createdAt) : new Date();

  const categoryRender = (category: string, index: number) => (
    <React.Fragment key={category}>
      {index !== 0 ? <span>{'>'}</span> : null}
      <Link
        href={`/blog?categoryIn=${categoryChain.slice(0, index + 1).join(',')}`}
        className="cursor-pointer hover:underline"
      >
        {category}
      </Link>
    </React.Fragment>
  );

  return (
    <div className="h-60">
      <header className="absolute top-0 left-0 h-64 w-full before:absolute before:bottom-0 before:left-0 before:right-0 before:top-0 before:z-0 before:bg-black before:opacity-40 before:content-['']">
        {thumbnailImage ? (
          <img
            src={`${thumbnailImage}?w=1280`}
            alt={title}
            className="my-0 h-64 w-full object-cover"
          />
        ) : null}
        <div className="absolute top-0 left-0 z-10 flex h-full w-full flex-col justify-center p-6 md:p-10">
          <Text className="mb-2 flex items-center gap-2 text-white" variant="d3">
            {categoryChain ? categoryChain.map(categoryRender) : null}
          </Text>
          <H1 className="mb-4 text-2xl text-white lg:text-4xl">{title}</H1>
          <Text className="flex items-center gap-2 text-zinc-300" variant="c1">
            <div>{format(createdDate, 'yyyy-MM-dd')}</div>
            <ViewCount />
            <Link href={`/admin/blog/write?urlSlug=${urlSlug}`}>수정</Link>
          </Text>
        </div>
      </header>
    </div>
  );
}

export default BlogHeader;
