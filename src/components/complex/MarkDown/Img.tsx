/* eslint-disable @next/next/no-img-element */
import React from 'react';

interface ImgProps {
  src: string;
  // eslint-disable-next-line react/require-default-props
  alt?: string;
}

const Img = function Img({ src, alt }: ImgProps) {
  if (!src) return null;

  const optimizedSrc = src.includes('?') ? `${src}&w=1280` : `${src}?w=1280`;

  return (
    <img
      src={optimizedSrc}
      alt={alt || ''}
      loading="lazy"
      className="my-8 block h-auto w-full max-w-full rounded-2xl border border-zinc-200/80 bg-zinc-100 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
    />
  );
};

export default Img;
