'use client';

import React from 'react';
import LocalesNav from '@components/complex/Nav/LocalesNav';
import Nav from 'components/complex/Nav';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type CommonLayoutProps = {
  children: React.ReactNode;
};

// const searchArray = ['/blog'];
const queryClient = new QueryClient();

function CommonLayout({ children }: CommonLayoutProps) {
  /*const isLocalesNavShown = useMemo(() => {
    return pathname !== null && !searchArray.some((searchStr) => pathname.includes(searchStr));
  }, [pathname]);*/

  return (
    <div className={'w-full min-h-screen flex flex-col dark:bg-black pb-[57px] lg:pb-0'}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      {/*{isLocalesNavShown && <LocalesNav />}*/}
      <LocalesNav />
      <Nav />
    </div>
  );
}

export default CommonLayout;
