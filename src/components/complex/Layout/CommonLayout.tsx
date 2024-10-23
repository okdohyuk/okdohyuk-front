'use client';

import React, { useEffect, useRef } from 'react';
import LocalesNav from '@components/complex/Nav/LocalesNav';
import Nav from 'components/complex/Nav';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';

type CommonLayoutProps = {
  children: React.ReactNode;
};

const queryClient = new QueryClient();

const navDisabledPath = ['/multi-live'];

function CommonLayout({ children }: CommonLayoutProps) {
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wrapperRef.current === null) return;
    /**
     * 구글 에드센스 광고가 삽입되면서 레이아웃이 깨지는 문제를 방지
     */
    const observer = new MutationObserver(() => {
      if (wrapperRef.current === null) return;
      wrapperRef.current.style.height = '';
      wrapperRef.current.style.minHeight = '';
    });
    observer.observe(wrapperRef.current, {
      attributeFilter: ['style'],
    });
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={'w-full min-h-screen flex flex-col dark:bg-black pb-[57px] lg:pb-0'}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      {!navDisabledPath.some((path) => pathname.includes(path)) && (
        <>
          <LocalesNav />
          <Nav />
        </>
      )}
    </div>
  );
}

export default CommonLayout;
