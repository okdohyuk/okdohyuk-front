import React from 'react';
import { cls } from '@utils/classNameUtils';

type SkeletonProps = {
  className?: string;
  h?: number;
  w?: number;
};

type SkeletonFC = React.FC<SkeletonProps>;

const Skeleton: SkeletonFC = ({ className = '', h, w }) => {
  return (
    <div
      className={cls(
        'animate-pulse bg-basic-4',
        h ? 'h-' + h : 'h-32',
        w ? 'w-' + w : 'w-full',
        className,
      )}
    />
  );
};

export default Skeleton;
