import React from 'react';

type CommonLayoutProps = {
  children: React.ReactNode;
};

function CommonLayout({ children }: CommonLayoutProps) {
  return <div className={'w-full min-h-screen dark:bg-black pb-[70px] lg:pb-auto'}>{children}</div>;
}

export default CommonLayout;
