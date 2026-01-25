/* eslint-disable react/require-default-props */
import React from 'react';
import { cn } from '@utils/cn';

type SkeletonProps = {
  className?: string;
  h?: number;
  w?: number;
};

function Skeleton({ className = '', h, w }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-basic-4',
        h ? `h-${h}` : 'h-32',
        w ? `w-${w}` : 'w-full',
        className,
      )}
    />
  );
}

export default Skeleton;
