import React, { useMemo } from 'react';
import LocalesNav from '@components/legacy/complex/Nav/LocalesNav';
import Nav from '../Nav';
import { useRouter } from 'next/router';

type CommonLayoutProps = {
  children: React.ReactNode;
};

const searchArray = ['/blog'];

function CommonLayout({ children }: CommonLayoutProps) {
  const { asPath } = useRouter();

  const isLocalesNavShown = useMemo(() => {
    return !searchArray.some((searchStr) => asPath.includes(searchStr));
  }, [asPath]);

  return (
    <div className={'w-full min-h-screen flex flex-col dark:bg-black pb-[57px] lg:pb-0'}>
      {children}
      {isLocalesNavShown && <LocalesNav />}
      <Nav />
    </div>
  );
}

export default CommonLayout;
