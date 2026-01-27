'use client';

import React, { useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import LocalesNav from '@components/complex/Nav/LocalesNav';
import Nav from '@components/complex/Nav';

type CommonLayoutProps = {
  children: React.ReactNode;
};

const queryClient = new QueryClient();

const navDisabledPath = ['/multi-live'];

function CommonLayout({ children }: CommonLayoutProps) {
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { current } = wrapperRef;
    if (!current) {
      return undefined;
    }

    const observer = new MutationObserver(() => {
      if (!wrapperRef.current) return;
      wrapperRef.current.style.height = '';
      wrapperRef.current.style.minHeight = '';
    });

    observer.observe(current, {
      attributeFilter: ['style'],
    });

    return () => observer.disconnect();
  }, []);

  const showNav = !navDisabledPath.some((path) => pathname.includes(path));

  return (
    <div ref={wrapperRef} className="w-full min-h-screen flex flex-col dark:bg-black">
      <QueryClientProvider client={queryClient}>
        {children}
        {showNav && (
          <>
            <LocalesNav />
            <Nav />
          </>
        )}
      </QueryClientProvider>
    </div>
  );
}

export default CommonLayout;
