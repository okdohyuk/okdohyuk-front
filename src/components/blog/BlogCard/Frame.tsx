import React from 'react';
import Image from 'next/legacy/image';
import DateUtils from '@utils/dateUtils';
import ClassName from '@utils/classNameUtils';
import MarkdownUtils from '@utils/markdownUtils';
import { BlogCardTypeFC } from './type';

const Frame: BlogCardTypeFC = function Frame({ blog }) {
  const { thumbnailImage, title, contents, createdAt } = blog;
  const { cls } = ClassName;

  return (
    <article
      className={cls(
        'flex flex-col h-80 md:h-96 rounded overflow-hidden bg-basic-3 hover:bg-basic-4',
      )}
    >
      {thumbnailImage ? (
        <div className="w-full h-32 md:h-40 relative">
          <Image
            src={`${thumbnailImage}?w=320`}
            blurDataURL={`${thumbnailImage}?w=50`}
            alt={title}
            layout="fill"
            objectFit="cover"
            placeholder="blur"
            unoptimized
          />
        </div>
      ) : null}
      <div className="flex flex-col flex-1 p-4">
        <h2 className="t-d-1 font-bold t-basic-1 line-clamp-1">{title}</h2>
        <p className="t-d-3 t-basic-1 line-clamp-3">{MarkdownUtils.removeMarkdown(contents)}</p>
        <span className="mt-auto t-c-1 t-basic-2" suppressHydrationWarning>
          {DateUtils.foramtDate(createdAt)}
        </span>
      </div>
    </article>
  );
};

export default Frame;
