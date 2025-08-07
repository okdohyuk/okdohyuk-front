import React from 'react';
import {
  MdCalculate,
  MdCode,
  MdLiveTv,
  MdOutlineAutoAwesome,
  MdOutlinePersonalVideo,
  MdOutlinePublic,
  MdPayment,
  MdTagFaces,
  MdViewList,
} from 'react-icons/md';
import { AiFillGithub, AiFillLinkedin, AiFillYoutube } from 'react-icons/ai';
import { BiBomb, BiServer } from 'react-icons/bi';
import { Language } from '~/app/i18n/settings';

type Title = {
  [key in Language]: string;
};

type MenuItem = {
  title: Title;
  icon: React.ReactNode;
  link: string;
};

type Menus = {
  [key: string]: MenuItem[];
};

const menus: Menus = {
  service: [
    {
      title: {
        ko: '퍼센트계산기',
        en: 'Percent Calculator',
        ja: 'パーセント計算機',
        zh: '百分比計算器',
      },
      icon: <MdCalculate />,
      link: '/percent',
    },
    {
      title: {
        ko: '할일',
        en: 'Todo',
        ja: 'やること',
        zh: '待辦事項',
      },
      icon: <MdViewList />,
      link: '/todo',
    },
    {
      title: {
        ko: '암호화 복호화',
        en: 'Coder',
        ja: 'エンコーダー/デコーダー',
        zh: '编码器/解码器',
      },
      icon: <MdCode />,
      link: '/coder',
    },
    {
      title: {
        ko: '멀티라이브',
        en: 'MultiLive',
        ja: 'マルチライブ',
        zh: '多平台直播',
      },
      icon: <MdLiveTv />,
      link: '/multi-live',
    },
    {
      title: {
        ko: '뽈롱',
        en: 'Ppollong',
        ja: 'ポロン',
        zh: '波隆',
      },
      icon: <BiBomb />,
      link: '/ppollong',
    },
    {
      title: {
        ko: '온라인 서버 시간 조회',
        en: 'Online Server Time Checker',
        ja: 'オンラインサーバー時間確認',
        zh: '在线服务器时间检查',
      },
      icon: <BiServer />,
      link: '/server-clock',
    },
    {
      title: {
        ko: '내 IP 주소 확인',
        en: 'My IP Address',
        ja: '自分のIPアドレス',
        zh: '我的IP地址',
      },
      icon: <MdOutlinePublic />,
      link: '/myip',
    },
  ],
  out: [
    {
      title: {
        ko: '프로필',
        en: 'Profile',
        ja: 'プロフィール',
        zh: '个人资料',
      },
      icon: <MdTagFaces />,
      link: 'https://okdohyuk.notion.site/',
    },
    {
      title: {
        ko: '티스토리',
        en: 'Tistory',
        ja: 'Tistory',
        zh: 'Tistory',
      },
      icon: <MdOutlinePersonalVideo />,
      link: 'https://blog.okdohyuk.dev/',
    },
    {
      title: {
        ko: '깃허브',
        en: 'Github',
        ja: 'GitHub',
        zh: 'GitHub',
      },
      icon: <AiFillGithub />,
      link: 'https://github.com/okdohyuk',
    },
    {
      title: {
        ko: '링크드인',
        en: 'LinkedIn',
        ja: 'LinkedIn',
        zh: '领英',
      },
      icon: <AiFillLinkedin />,
      link: 'https://www.linkedin.com/in/okdohyuk/',
    },
    {
      title: {
        ko: '유튜브',
        en: 'YouTube',
        ja: 'YouTube',
        zh: 'YouTube',
      },
      icon: <AiFillYoutube />,
      link: 'https://www.youtube.com/@okdohyuk',
    },
    {
      title: {
        ko: '후원하기',
        en: 'Donate',
        ja: '寄付する',
        zh: '赞助',
      },
      icon: <MdPayment />,
      link: 'https://github.com/sponsors/okdohyuk?frequency=recurring',
    },
  ],
  trash: [
    {
      title: {
        ko: '해몽',
        en: 'Dream Resolver',
        ja: '夢占い',
        zh: '解梦',
      },
      icon: <MdOutlineAutoAwesome />,
      link: '/dream-resolver',
    },
  ],
};

export type { MenuItem, Menus };
export { menus };
