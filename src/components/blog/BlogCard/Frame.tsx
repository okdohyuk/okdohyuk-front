import React from 'react';
import { BlogCardTypeFC } from './type';
import ClassName from '~/utils/classNameUtils';
import markdownUtils from '~/utils/markdownUtils';
import Image from 'next/image';

const Frame: BlogCardTypeFC = ({ blog }) => {
  const { thumbnailImage, title, contents, tags } = blog;
  const { cls } = ClassName;

  return (
    <article className={cls('rounded overflow-hidden bg-basic-3 hover:bg-basic-4')}>
      {thumbnailImage ? (
        <div className={'w-full h-[100px] md:h-[200px] relative'}>
          <Image src={thumbnailImage} alt={title} layout={'fill'} objectFit={'cover'} />
        </div>
      ) : null}
      <div className="px-4 py-4">
        <div className="t-d-1 font-bold t-basic-1">{title}</div>
        <p className="t-d-3 t-basic-1 line-clamp-5">{markdownUtils.removeMarkdown(contents)}</p>
      </div>
      <div className="px-4 pt-4">
        {tags.map((tag) => (
          <span
            className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
            key={tag}
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
};

export default Frame;
