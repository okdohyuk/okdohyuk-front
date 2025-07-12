import React, { useState, useEffect } from 'react';
import { cls } from '~/utils/classNameUtils';

interface ImgProps {
  src?: string;
  alt?: string;
}

const Img = ({ src, alt }: ImgProps) => {
  const [aspectRatio, setAspectRatio] = useState<number | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setAspectRatio(img.naturalWidth / img.naturalHeight - 64);
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
        alt={alt || ''}
        onLoad={() => setIsLoaded(true)}
        className={cls(
          'w-full h-full object-contain transition-opacity duration-300 ease-in-out',
          isLoaded ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  );
};

export default Img;
