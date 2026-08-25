import { getPageGroup, PageGroup } from './gtag';

const BLOCKED_PAGE_GROUPS: ReadonlySet<PageGroup> = new Set([
  'home',
  'blog_list',
  'blog_detail',
  'auth',
  'legal',
  'live',
  'menu',
  'admin',
]);

const SOLVE_PATH_PATTERN = /^\/[a-z]{2}\/solve(?:\/|$)/;

/**
 * GA4에서 확인한 도구 사용 의도가 있는 화면에만 광고 슬롯을 허용한다.
 * 개인 식별 정보나 국가별 값은 광고 정책 판단에 사용하지 않는다.
 */
export function isAdEligiblePath(pathname: string): boolean {
  if (!pathname) return false;

  const pageGroup = getPageGroup(pathname);
  if (BLOCKED_PAGE_GROUPS.has(pageGroup)) return false;

  return pageGroup === 'tool' || SOLVE_PATH_PATTERN.test(pathname);
}
