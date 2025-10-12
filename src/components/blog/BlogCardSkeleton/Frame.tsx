import React from 'react';
import Skeleton from '@components/basic/Skeleton';

function Frame() {
  return (
    <article className="flex flex-col h-80 md:h-96 rounded overflow-hidden bg-basic-3">
      <Skeleton className="w-full h-32 md:h-40 relative" />

      <div className="flex flex-col flex-1 p-4">
        <Skeleton h={6} />
        <Skeleton className="mt-2" h={16} />
        <Skeleton className="mt-auto" h={4} w={12} />
      </div>
    </article>
  );
}

export default Frame;
