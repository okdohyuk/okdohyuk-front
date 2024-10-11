import React from 'react';
import { BlogCardTypeFC } from './type';
import ClassName from '@utils/classNameUtils';
import markdownUtils from '@utils/markdownUtils';
import Image from 'next/legacy/image';
import DateUtils from '@utils/dateUtils';

const Discript: BlogCardTypeFC = ({ blog }) => {
  const { thumbnailImage, title, contents, createdAt } = blog;
  const { cls } = ClassName;

  return (
    <article
      className={cls(
        'md:min-h-[200px] flex p-2 rounded-md gap-6 overflow-hidden bg-basic-3 hover:bg-basic-4',
      )}
    >
      <div className={'relative'}>
        {thumbnailImage ? (
          <div
            className={
              'w-[100px] h-[100px] md:w-[200px] md:h-[200px] relative rounded overflow-hidden'
            }
          >
            <Image src={thumbnailImage} alt={title} layout={'fill'} objectFit={'cover'} />
          </div>
        ) : null}
      </div>
      <div className={'flex flex-col flex-1 text-left justify-start overflow-hidden'}>
        <h2 className={'my-1 md:my-4 t-d-1 font-bold t-basic-1 line-clamp-1'}>{title}</h2>
        <p className={'t-d-3 t-basic-1 line-clamp-2 md:line-clamp-4'}>
          {markdownUtils.removeMarkdown(contents)}
        </p>
        <span className="mt-auto md:mb-4 t-c-1 t-basic-2" suppressHydrationWarning>
          {DateUtils.foramtDate(createdAt)}
        </span>
      </div>
    </article>
  );
};

export default Discript;
