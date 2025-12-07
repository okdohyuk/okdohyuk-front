import React from 'react';
import Image from 'next/legacy/image';
import Tag from '@components/basic/Tag';
import ClassName from '@utils/classNameUtils';
import { BlogCardTypeFC } from './type';

const Board: BlogCardTypeFC = function Board({ blog }) {
  const { thumbnailImage, title, isPublic, tags } = blog;
  const { cls } = ClassName;

  return (
    <article
      className={cls(
        'flex items-center p-1 rounded-md overflow-hidden bg-basic-3 hover:bg-basic-4',
        isPublic ? '' : 'bg-red-300',
      )}
    >
      <div className="flex shrink-0 w-12 h-12 relative">
        {thumbnailImage ? (
          <Image
            src={`${thumbnailImage}?w=150`}
            blurDataURL={`${thumbnailImage}?w=50`}
            alt={title}
            layout="fill"
            objectFit="cover"
            placeholder="blur"
            unoptimized
          />
        ) : null}
      </div>

      <h2 className="ml-2 t-d-2 t-basic-1 line-clamp-1">{title}</h2>

      <div className="ml-auto flex whitespace-nowrap overflow-hidden">
        {tags.map((t) => (
          <Tag tag={t} key={t} />
        ))}
      </div>
    </article>
  );
};

export default Board;
