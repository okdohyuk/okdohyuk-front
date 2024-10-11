'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MdArticle, MdHome, MdMenu } from 'react-icons/md';
import Link from '@components/basic/Link';
import ClassName from '@utils/classNameUtils';
import { sendGAEvent } from '@libs/client/gtag';

type NavItem = {
  name: string;
  icon: React.ReactNode;
  link: string;
  pathname: string;
};

const navList: NavItem[] = [
  {
    name: 'Home',
    icon: <MdHome size={24} />,
    link: '/',
    pathname: '/home',
  },
  {
    name: 'Blog',
    icon: <MdArticle size={24} />,
    link: '/blog',
    pathname: '/blog',
  },
  {
    name: 'Menu',
    icon: <MdMenu size={24} />,
    link: '/menu',
    pathname: '/menu',
  },
];

function Nav() {
  const pathname = usePathname();
  const { cls } = ClassName;

  return (
    <div
      className={
        'fixed z-30 bottom-0 left-0 bg-zinc-100 dark:bg-zinc-800 w-full lg:bottom-5 lg:right-5 lg:left-auto lg:w-auto lg:rounded-full lg:shadow-md'
      }
    >
      <ul
        className={
          'h-[57px] flex justify-around align-center w-full mb-safe lg:w-[57px] lg:h-[300px] lg:flex-col text-center'
        }
      >
        {navList.map((navItem) => (
          <li key={navItem.name} className={'w-[32px] h-[32px] m-auto'}>
            <Link
              href={navItem.link}
              className={'w-full h-full flex align-center justify-center text-center'}
            >
              <div
                onClick={() => sendGAEvent('link_click', navItem.name)}
                className={cls(
                  (pathname + '').includes(navItem.pathname) ||
                    (navItem.pathname === '/home' && pathname?.length === 3)
                    ? 'text-black dark:text-white'
                    : 'text-gray-500 hover:text-black hover:dark:text-white',
                  'm-auto',
                )}
              >
                {navItem.icon}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Nav;
