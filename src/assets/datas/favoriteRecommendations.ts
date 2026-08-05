/**
 * 즐겨찾기가 비어 있을 때 홈에서 먼저 권하는 도구 목록.
 *
 * 선정 기준은 GA4 실측(최근 90일) 상위 도구이며, 랜딩 스토리 챕터
 * (`landingShowcase.SHOWCASE_CHAPTER_LINKS`)와 같은 데이터에 근거한다.
 * 도구의 제목/아이콘은 `menus.tsx`, 카테고리는 `serviceCategories.ts` 를 그대로 재사용하므로
 * 여기서는 "어떤 링크를 어떤 순서로 권할지"만 정의한다.
 */
export const FAVORITE_RECOMMENDED_LINKS = [
  '/pokemon-type-calculator',
  '/server-clock',
  '/multi-live',
  '/pokemon-weakness',
  '/shortener',
  '/qr-generator',
] as const;
