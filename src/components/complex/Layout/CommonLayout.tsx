'use client';

import React, { useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import LocalesNav from '@components/complex/Nav/LocalesNav';
import Nav from '@components/complex/Nav';
import CommandPalette from '@components/complex/CommandPalette/CommandPalette';

type CommonLayoutProps = {
  children: React.ReactNode;
};

const queryClient = new QueryClient();

const navDisabledPath = ['/multi-live', '/ppt/present', '/ppt/remote'];
const commandPaletteDisabledPath = ['/ppt/present', '/ppt/remote'];

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
  const showCommandPalette = !commandPaletteDisabledPath.some((path) => pathname.includes(path));

  return (
    <div ref={wrapperRef} className="w-full min-h-screen flex flex-col bg-basic-0">
      <QueryClientProvider client={queryClient}>
        {children}
        {showNav && (
          // Desktop dock: language select stacked on the icon nav, bottom-right.
          // On mobile each child positions itself (fixed), so the dock is layout-neutral.
          <div className="lg:fixed lg:bottom-6 lg:right-6 lg:z-30 lg:flex lg:flex-col lg:items-end lg:gap-2">
            <LocalesNav />
            <Nav />
          </div>
        )}
        {showCommandPalette && <CommandPalette />}
      </QueryClientProvider>
    </div>
  );
}

export default CommonLayout;
