'use client';

import React, { useState } from 'react';
import ModernDrawer from 'react-modern-drawer';
import BlogSearchNav from '@components/blog/BlogSearchNav';
import BlogSearchBar from '@components/legacy/blog/BlogSearchBar';

import 'react-modern-drawer/dist/index.css';
import { Language } from '~/app/i18n/settings';
import useIsClient from '@hooks/useIsClient';

const Drawer = ({ params: { lng } }: { params: { lng: Language } }) => {
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
          <BlogSearchNav lng={lng} />
        </ModernDrawer>
      )}
    </>
  );
};

export default Drawer;
