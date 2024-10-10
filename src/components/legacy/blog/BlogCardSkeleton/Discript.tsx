import React from 'react';
import Skeleton from '@components/basic/Skeleton';

const Discript = () => {
  return (
    <article className="md:min-h-[200px] flex p-2 rounded-md gap-6 overflow-hidden bg-basic-3">
      <Skeleton className="w-[100px] h-[100px] md:w-[200px] md:h-[200px] relative rounded overflow-hidden" />

      <div className={'flex flex-col flex-1 text-left justify-start overflow-hidden'}>
        <Skeleton className="my-1 md:my-4" h={6} />
        <Skeleton className="" h={16} />
        <Skeleton className="mt-auto md:mb-4" h={4} w={12} />
      </div>
    </article>
  );
};

export default Discript;
