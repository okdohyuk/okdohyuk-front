import React from 'react';
import { BlogCardTypeFC } from './type';
import ClassName from '~/utils/classNameUtils';
import Image from 'next/image';

const Board: BlogCardTypeFC = ({ blog }) => {
  const { thumbnailImage, title, isPublic } = blog;
  const { cls } = ClassName;

  return (
    <article
      className={cls(
        'flex items-center p-1 rounded-md gap-6 overflow-hidden bg-basic-3 hover:bg-basic-4',
        isPublic ? '' : 'bg-red-300',
      )}
    >
      <div className={'w-[50px] h-[50px] relative'}>
        {thumbnailImage ? (
          <Image src={thumbnailImage} alt={title} layout={'fill'} objectFit={'cover'} />
        ) : null}
      </div>

      <h2 className={'t-d-1 t-basic-1 line-clamp-1'}>{title}</h2>
      <div>{blog.category}</div>
      <div>{blog.tags}</div>
    </article>
  );
};

export default Board;
