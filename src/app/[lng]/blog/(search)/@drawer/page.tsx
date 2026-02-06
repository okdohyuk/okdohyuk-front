'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import BlogSearchNav from '@components/blog/BlogSearchNav';
import BlogSearchBar from '@components/blog/BlogSearchBar';

import 'react-modern-drawer/dist/index.css';
import useIsClient from '@hooks/useIsClient';
import { Language } from '~/app/i18n/settings';

const ModernDrawer = dynamic(() => import('react-modern-drawer'), {
  ssr: false,
});

function Drawer() {
  const params = useParams<{ lng?: string }>();
  const language = (params?.lng ?? 'ko') as Language;

  const [isOpen, setIsOpen] = useState(false);
  const isClient = useIsClient();
  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  return (
    <>
      <BlogSearchBar toggleDrawer={toggleDrawer} lng={language} />
      {isClient && (
        <ModernDrawer
          open={isOpen}
          onClose={toggleDrawer}
          direction="right"
          className="!bg-transparent"
        >
          <div className="h-full bg-zinc-100/95 p-3 backdrop-blur-md dark:bg-zinc-900/95">
            <BlogSearchNav lng={language} />
          </div>
        </ModernDrawer>
      )}
    </>
  );
}

export default Drawer;
