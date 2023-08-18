import React from 'react';
import {
  MdCalculate,
  MdViewList,
  MdTagFaces,
  MdOutlinePersonalVideo,
  MdPayment,
  MdOutlineAutoAwesome,
  MdCode,
  MdOutlineWebAsset,
} from 'react-icons/md';
import { AiFillGithub, AiFillLinkedin, AiFillYoutube } from 'react-icons/ai';

type MenuItem = {
  title: string;
  titlen: string;
  icon: React.ReactNode;
  link: string;
};

type Menus = {
  [key: string]: MenuItem[];
};

const menus: Menus = {
  service: [
    {
      title: '퍼센트계산기',
      titlen: 'Percent Calculator',
      icon: <MdCalculate />,
      link: '/percent',
    },
    {
      title: '할일',
      titlen: 'Todo',
      icon: <MdViewList />,
      link: '/todo',
    },
    {
      title: '암호화 복호화',
      titlen: 'Coder',
      icon: <MdCode />,
      link: '/coder',
    },
  ],
  out: [
    {
      title: '프로필',
      titlen: 'Profile',
      icon: <MdTagFaces />,
      link: 'https://okdohyuk.notion.site/',
    },
    {
      title: '티스토리',
      titlen: 'Tistory',
      icon: <MdOutlinePersonalVideo />,
      link: 'https://blog.okdohyuk.dev/',
    },
    {
      title: '깃허브',
      titlen: 'Github',
      icon: <AiFillGithub />,
      link: 'https://github.com/okdohyuk',
    },
    {
      title: '링크드인',
      titlen: 'Linkedin',
      icon: <AiFillLinkedin />,
      link: 'https://www.linkedin.com/in/okdohyuk/',
    },
    {
      title: '유튜브',
      titlen: 'Youtube',
      icon: <AiFillYoutube />,
      link: 'https://www.youtube.com/@okdohyuk',
    },
    {
      title: '후원하기',
      titlen: 'Donate',
      icon: <MdPayment />,
      link: 'https://toss.me/guksu',
    },
  ],
  trash: [
    {
      title: '해몽',
      titlen: 'Dream Resorlver',
      icon: <MdOutlineAutoAwesome />,
      link: '/dream-resolver',
    },
    {
      title: '블로그',
      titlen: 'Blog',
      icon: <MdOutlineWebAsset />,
      link: '/blog',
    },
  ],
};

export type { MenuItem, Menus };
export { menus };
