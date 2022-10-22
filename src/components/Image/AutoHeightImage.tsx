import React from 'react';
import Image, { ImageProps } from 'next/image';

const AutoHeightImage = ({ ...props }: ImageProps) => {
  return (
    <div className={'auto-image'}>
      <Image layout="fill" {...props} />
    </div>
  );
};

export default AutoHeightImage;
