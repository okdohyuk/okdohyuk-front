'use client';

import React from 'react';
import LocalesNav from '@components/complex/Nav/LocalesNav';
import Nav from 'components/complex/Nav';

type CommonLayoutProps = {
  children: React.ReactNode;
};

// const searchArray = ['/blog'];

function CommonLayout({ children }: CommonLayoutProps) {
  /*const isLocalesNavShown = useMemo(() => {
    return pathname !== null && !searchArray.some((searchStr) => pathname.includes(searchStr));
  }, [pathname]);*/

  return (
    <div className={'w-full min-h-screen flex flex-col dark:bg-black pb-[57px] lg:pb-0'}>
      {children}
      {/*{isLocalesNavShown && <LocalesNav />}*/}
      <LocalesNav />
      <Nav />
    </div>
  );
}

export default CommonLayout;
