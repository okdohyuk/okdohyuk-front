/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import { cls } from '~/utils/classNameUtils';

interface ImgProps {
  src: string;
  // eslint-disable-next-line react/require-default-props
  alt?: string;
}

const Img = function Img({ src, alt }: ImgProps) {
  const [aspectRatio, setAspectRatio] = useState<number | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = `${src}?w=512`;
    img.onload = () => {
      setAspectRatio(img.naturalWidth / img.naturalHeight);
    };
  }, [src]);

  if (!src) return null;

  const blurImageUrl = `${src}?w=50`;

  return (
    <div
      className="relative w-full overflow-hidden bg-zinc-100 my-8"
      style={{
        aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
        minHeight: aspectRatio ? undefined : '200px',
      }}
    >
      {!isLoaded && (
        <img
          src={blurImageUrl}
          alt={alt || 'loading'}
          className="absolute top-0 left-0 w-full h-[calc(100%-4em)] object-cover blur-sm scale-100"
        />
      )}
      <img
        src={`${src}?w=1280`}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={cls(
          'object-contain transition-opacity duration-300 ease-in-out',
          isLoaded ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  );
};

export default Img;
