import React from 'react';
import { BlogCardTypeFC } from './type';
import ClassName from '~/utils/classNameUtils';
import Image from 'next/image';
import Tag from '~/components/basic/Tag';

const Board: BlogCardTypeFC = ({ blog }) => {
  const { thumbnailImage, title, isPublic, tags } = blog;
  const { cls } = ClassName;

  return (
    <article
      className={cls(
        'flex items-center p-1 rounded-md overflow-hidden bg-basic-3 hover:bg-basic-4',
        isPublic ? '' : 'bg-red-300',
      )}
    >
      <div className={'flex shrink-0 w-12 h-12 relative'}>
        {thumbnailImage ? (
          <Image src={thumbnailImage} alt={title} layout={'fill'} objectFit={'cover'} />
        ) : null}
      </div>

      <h2 className={'ml-2 t-d-2 t-basic-1 line-clamp-1'}>{title}</h2>

      <div className="ml-auto flex whitespace-nowrap overflow-hidden">
        {tags.map((t) => (
          <Tag tag={t} />
        ))}
      </div>
    </article>
  );
};

export default Board;
