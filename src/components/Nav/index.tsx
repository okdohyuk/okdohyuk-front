import React from 'react';
import { useRouter } from 'next/router';
import { MdHome, MdViewList, MdCalculate } from 'react-icons/md';
import Link from '@components/Link';
import Icon from '@components/Icon';
import ClassName from '@utils/classNameUtils';

type NavItem = {
  name: string;
  icon: React.ReactNode;
  link: string;
};

const navList: NavItem[] = [
  {
    name: 'Home',
    icon: <MdHome />,
    link: '/',
  },
  { name: 'Todo', icon: <MdViewList />, link: '/todo' },
  {
    name: 'Percent',
    icon: <MdCalculate />,
    link: '/percent',
  },
];

function Nav() {
  const router = useRouter();
  const { cls } = ClassName;

  return (
    <div
      className={
        'fixed z-30 bottom-0 left-0 bg-zinc-100 dark:bg-zinc-800 w-full lg:bottom-5 lg:right-5 lg:left-auto lg:w-auto lg:rounded-full'
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
              <Icon
                icon={navItem.icon}
                className={cls(
                  router.asPath === navItem.link
                    ? 'text-black dark:text-white'
                    : 'text-gray-500 hover:text-black hover:dark:text-white',
                  'm-auto',
                )}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Nav;
