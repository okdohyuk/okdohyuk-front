import { Language } from '~/app/i18n/settings';

type ServiceSectionKey =
  | 'planning'
  | 'finance'
  | 'generator'
  | 'textData'
  | 'devUtility'
  | 'lifestyle';

const SERVICE_SECTION_ORDER: ServiceSectionKey[] = [
  'planning',
  'finance',
  'generator',
  'textData',
  'devUtility',
  'lifestyle',
];

const SERVICE_SECTION_BY_LINK: Record<string, ServiceSectionKey> = {
  '/todo': 'planning',
  '/bedtime-planner': 'planning',
  '/age-calculator': 'planning',
  '/date-diff': 'planning',
  '/anniversary-counter': 'planning',
  '/server-clock': 'planning',
  '/stopwatch': 'planning',
  '/multi-live': 'planning',
  '/percent': 'finance',
  '/sales-tax-calculator': 'finance',
  '/commute-cost': 'finance',
  '/salary-converter': 'finance',
  '/korean-amount': 'finance',
  '/qr-generator': 'generator',
  '/lotto-generator': 'generator',
  '/coin-flip': 'generator',
  '/cron-generator': 'generator',
  '/uuid-generator': 'generator',
  '/css-generator': 'generator',
  '/passphrase-generator': 'generator',
  '/csv-json-converter': 'textData',
  '/json-yaml-converter': 'textData',
  '/slug-generator': 'textData',
  '/url-parser': 'textData',
  '/text-counter': 'textData',
  '/text-reverser': 'textData',
  '/text-repeater': 'textData',
  '/markdown-table-generator': 'textData',
  '/roman-converter': 'textData',
  '/choseong-maker': 'textData',
  '/jwt-decoder': 'devUtility',
  '/coder': 'devUtility',
  '/contrast-checker': 'devUtility',
  '/data-size-converter': 'devUtility',
  '/water-intake': 'lifestyle',
  '/bmi-calculator': 'lifestyle',
  '/bpm-tapper': 'lifestyle',
  '/ppollong': 'lifestyle',
  '/pokemon-type-calculator': 'lifestyle',
};

const SERVICE_SECTION_BADGES: Record<Language, Record<ServiceSectionKey, string>> = {
  ko: {
    planning: '일정/시간',
    finance: '계산/금융',
    generator: '생성/자동화',
    textData: '텍스트/데이터',
    devUtility: '개발/유틸리티',
    lifestyle: '라이프/기타',
  },
  en: {
    planning: 'Planning & Time',
    finance: 'Calculation & Finance',
    generator: 'Generators & Automation',
    textData: 'Text & Data',
    devUtility: 'Developer Utilities',
    lifestyle: 'Lifestyle & Misc',
  },
  ja: {
    planning: '日程・時間',
    finance: '計算・金融',
    generator: '生成・自動化',
    textData: 'テキスト・データ',
    devUtility: '開発・ユーティリティ',
    lifestyle: 'ライフ・その他',
  },
  zh: {
    planning: '日程与时间',
    finance: '计算与财务',
    generator: '生成与自动化',
    textData: '文本与数据',
    devUtility: '开发与实用',
    lifestyle: '生活与其他',
  },
};

const getServiceSectionKey = (link: string): ServiceSectionKey => {
  return SERVICE_SECTION_BY_LINK[link] ?? 'devUtility';
};

const getServiceCategoryBadge = (language: Language, link: string) => {
  return SERVICE_SECTION_BADGES[language][getServiceSectionKey(link)];
};

export {
  SERVICE_SECTION_BY_LINK,
  SERVICE_SECTION_ORDER,
  getServiceSectionKey,
  getServiceCategoryBadge,
};

export type { ServiceSectionKey };
