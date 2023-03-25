import React from 'react';

import LocalesNav from '../Nav/LocalesNav';
import Nav from '../Nav';

type CommonLayoutProps = {
  children: React.ReactNode;
};

function CommonLayout({ children }: CommonLayoutProps) {
  return (
    <div className={'w-full min-h-screen dark:bg-black pb-[70px] lg:pb-auto'}>
      {children}
      <LocalesNav />
      <Nav />
    </div>
  );
}

export default CommonLayout;
