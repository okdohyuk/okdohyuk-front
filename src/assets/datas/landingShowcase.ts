import { menus, MenuItem } from '@assets/datas/menus';
import {
  ServiceSectionKey,
  SERVICE_SECTION_ORDER,
  getServiceSectionKey,
} from '@assets/datas/serviceCategories';

/**
 * 랜딩 페이지가 노출할 도구 구성.
 *
 * 도구의 제목/아이콘은 `menus.tsx`(4개 언어 title 포함)를, 카테고리 분류는
 * `serviceCategories.ts`를 단일 소스로 재사용한다. 여기서는 "어떤 순서로,
 * 어떤 도구를 랜딩에 띄울지"만 정의한다. 우선순위는 GA4 실측(최근 90일) 기준.
 */

const SERVICE_MENU_BY_LINK: Map<string, MenuItem> = new Map(
  menus.service.map((item) => [item.link, item]),
);

export const getServiceMenuItem = (link: string): MenuItem | undefined =>
  SERVICE_MENU_BY_LINK.get(link);

/** 랜딩에서 소개 가능한 전체 도구 수 (히어로 지표에 사용) */
export const SERVICE_TOOL_COUNT = menus.service.length;

/** 카테고리별 도구 수 */
export const SERVICE_TOOL_COUNT_BY_SECTION: Record<ServiceSectionKey, number> =
  menus.service.reduce(
    (acc, item) => {
      const section = getServiceSectionKey(item.link);
      acc[section] += 1;
      return acc;
    },
    Object.fromEntries(SERVICE_SECTION_ORDER.map((key) => [key, 0])) as Record<
      ServiceSectionKey,
      number
    >,
  );

export const SHOWCASE_CHAPTER_IDS = ['pokemon', 'clock', 'live'] as const;

export type ShowcaseChapterId = (typeof SHOWCASE_CHAPTER_IDS)[number];

/** 스크롤 스토리 챕터별 [대표 도구, ...함께 쓰는 도구] — 첫 항목이 주 CTA */
export const SHOWCASE_CHAPTER_LINKS: Record<ShowcaseChapterId, string[]> = {
  pokemon: ['/pokemon-type-calculator', '/pokemon-weakness', '/pokemon-team'],
  clock: ['/server-clock', '/stopwatch', '/bedtime-planner'],
  live: ['/multi-live', '/shortener', '/qr-generator'],
};

/** 벤토 그리드 카테고리별 대표 도구 */
export const CATEGORY_FEATURED_LINKS: Record<ServiceSectionKey, string[]> = {
  planning: ['/server-clock', '/multi-live', '/date-diff', '/anniversary-counter'],
  finance: ['/korean-amount', '/percent', '/salary-converter'],
  generator: ['/qr-generator', '/lotto-generator', '/uuid-generator'],
  textData: ['/text-counter', '/json-yaml-converter', '/markdown-table-generator'],
  devUtility: ['/anti-copykiller', '/jwt-decoder', '/network-calculator'],
  lifestyle: ['/pokemon-type-calculator', '/pokemon-weakness', '/ppollong'],
  learning: ['/solve'],
};

/**
 * 6컬럼 벤토 그리드 span. 4+2 / 3+3 / 2+4 / 6 리듬으로 애플 스타일 벤토를 만든다.
 * SERVICE_SECTION_ORDER와 같은 순서를 유지한다.
 */
export const CATEGORY_BENTO_SPAN: Record<ServiceSectionKey, 2 | 3 | 4 | 6> = {
  planning: 4,
  finance: 2,
  generator: 3,
  textData: 3,
  devUtility: 2,
  lifestyle: 4,
  learning: 6,
};
