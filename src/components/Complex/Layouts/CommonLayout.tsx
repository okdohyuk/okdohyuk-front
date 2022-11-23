import React from 'react';
import Opengraph, { OpengraphProps } from '@components/Basic/Opengraph';

type CommonLayoutProps = {
  children: React.ReactNode;
} & OpengraphProps;

function CommonLayout({
  children,
  title,
  ogTitle,
  description,
  isMainPage,
  image,
}: CommonLayoutProps) {
  return (
    <div className={'w-full min-h-screen dark:bg-black pb-[70px] lg:pb-auto'}>
      <Opengraph
        title={title}
        ogTitle={ogTitle}
        description={description}
        image={image}
        isMainPage={isMainPage}
      />
      {children}
    </div>
  );
}

export default CommonLayout;
