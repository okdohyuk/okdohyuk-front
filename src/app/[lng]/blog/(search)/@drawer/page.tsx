'use client';

import React, { use, useState } from 'react';
import dynamic from 'next/dynamic';
import BlogSearchNav from '@components/blog/BlogSearchNav';
import BlogSearchBar from '@components/blog/BlogSearchBar';

import 'react-modern-drawer/dist/index.css';
import useIsClient from '@hooks/useIsClient';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';

const ModernDrawer = dynamic(() => import('react-modern-drawer'), {
  ssr: false,
});

function Drawer({ params }: LanguageParams) {
  const { lng } = use(params);
  const language = lng as Language;

  const [isOpen, setIsOpen] = useState(false);
  const isClient = useIsClient();
  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  return (
    <>
      <BlogSearchBar toggleDrawer={toggleDrawer} />
      {isClient && (
        <ModernDrawer
          open={isOpen}
          onClose={toggleDrawer}
          direction="right"
          className="!bg-zinc-100 dark:!bg-zinc-800"
        >
          <BlogSearchNav lng={language} />
        </ModernDrawer>
      )}
    </>
  );
}

export default Drawer;
