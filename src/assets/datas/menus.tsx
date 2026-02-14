import React from 'react';
import {
  Bomb,
  Calculator,
  CalendarClock,
  CalendarDays,
  Code,
  CreditCard,
  Github,
  Hash,
  Key,
  Linkedin,
  List,
  MonitorPlay,
  Palette,
  QrCode,
  Server,
  Smile,
  Sparkles,
  TextCursorInput,
  Tv,
  Youtube,
} from 'lucide-react';
import { Language } from '~/app/i18n/settings';

type Title = Record<Language, string>;

type MenuItem = {
  title: Title;
  icon: React.ReactNode;
  link: string;
};

type Menus = {
  [menuKey: string]: MenuItem[];
};

const menus: Menus = {
  service: [
    {
      title: {
        ko: 'QR 코드 생성기',
        en: 'QR Code Generator',
        ja: 'QRコード生成器',
        zh: '二维码生成器',
      },
      icon: <QrCode />,
      link: '/qr-generator',
    },
    {
      title: {
        ko: 'Cron 생성기',
        en: 'Cron Generator',
        ja: 'Cron生成器',
        zh: 'Cron生成器',
      },
      icon: <CalendarClock />,
      link: '/cron-generator',
    },
    {
      title: {
        ko: 'JWT 디코더',
        en: 'JWT Decoder',
        ja: 'JWTデコーダー',
        zh: 'JWT解码器',
      },
      icon: <Key />,
      link: '/jwt-decoder',
    },
    {
      title: {
        ko: 'CSS 생성기',
        en: 'CSS Generator',
        ja: 'CSSジェネレーター',
        zh: 'CSS生成器',
      },
      icon: <Palette />,
      link: '/css-generator',
    },
    {
      title: {
        ko: '슬러그 생성기',
        en: 'Slug Generator',
        ja: 'スラッグ生成器',
        zh: 'Slug 生成器',
      },
      icon: <Hash />,
      link: '/slug-generator',
    },
    {
      title: {
        ko: '퍼센트계산기',
        en: 'Percent Calculator',
        ja: 'パーセント計算機',
        zh: '百分比計算器',
      },
      icon: <Calculator />,
      link: '/percent',
    },
    {
      title: {
        ko: '할일',
        en: 'Todo',
        ja: 'やること',
        zh: '待辦事項',
      },
      icon: <List />,
      link: '/todo',
    },
    {
      title: {
        ko: '암호화 복호화',
        en: 'Coder',
        ja: 'エンコーダー/デコーダー',
        zh: '编码器/解码器',
      },
      icon: <Code />,
      link: '/coder',
    },
    {
      title: {
        ko: '멀티라이브',
        en: 'MultiLive',
        ja: 'マルチライブ',
        zh: '多平台直播',
      },
      icon: <Tv />,
      link: '/multi-live',
    },
    {
      title: {
        ko: '뽈롱',
        en: 'Ppollong',
        ja: 'ポロン',
        zh: '波隆',
      },
      icon: <Bomb />,
      link: '/ppollong',
    },
    {
      title: {
        ko: '온라인 서버 시간 조회',
        en: 'Online Server Time Checker',
        ja: 'オンラインサーバー時間確認',
        zh: '在线服务器时间检查',
      },
      icon: <Server />,
      link: '/server-clock',
    },
    {
      title: {
        ko: '유통기한 계산기',
        en: 'Expiry Date Calculator',
        ja: '賞味期限計算機',
        zh: '保质期计算器',
      },
      icon: <CalendarDays />,
      link: '/expiry-date',
    },
    {
      title: {
        ko: '초성메이커',
        en: 'Choseong Maker',
        ja: 'チョソンメーカー',
        zh: '初聲製作器',
      },
      icon: <TextCursorInput />,
      link: '/choseong-maker',
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
      icon: <Smile />,
      link: 'https://okdohyuk.notion.site/',
    },
    {
      title: {
        ko: '티스토리',
        en: 'Tistory',
        ja: 'Tistory',
        zh: 'Tistory',
      },
      icon: <MonitorPlay />,
      link: 'https://blog.okdohyuk.dev/',
    },
    {
      title: {
        ko: '깃허브',
        en: 'Github',
        ja: 'GitHub',
        zh: 'GitHub',
      },
      icon: <Github />,
      link: 'https://github.com/okdohyuk',
    },
    {
      title: {
        ko: '링크드인',
        en: 'LinkedIn',
        ja: 'LinkedIn',
        zh: '领英',
      },
      icon: <Linkedin />,
      link: 'https://www.linkedin.com/in/okdohyuk/',
    },
    {
      title: {
        ko: '유튜브',
        en: 'YouTube',
        ja: 'YouTube',
        zh: 'YouTube',
      },
      icon: <Youtube />,
      link: 'https://www.youtube.com/@okdohyuk',
    },
    {
      title: {
        ko: '후원하기',
        en: 'Donate',
        ja: '寄付する',
        zh: '赞助',
      },
      icon: <CreditCard />,
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
      icon: <Sparkles />,
      link: '/dream-resolver',
    },
  ],
};

export type { MenuItem, Menus };
export { menus };
