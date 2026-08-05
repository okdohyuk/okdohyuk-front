import { useCallback, useMemo, useSyncExternalStore } from 'react';

const NOOP_UNSUBSCRIBE = () => {};

/**
 * CSS 미디어 쿼리 매칭 상태를 구독한다.
 *
 * `useEffect` + `setState` 대신 `useSyncExternalStore` 를 쓰는 이유:
 * 전자는 하이드레이션 페인트가 끝난 뒤에야 값을 반영해 레이아웃이 한 번 튄다(CLS).
 * `useSyncExternalStore` 는 하이드레이션 직후 동기 재렌더로 실제 값을 반영하므로 점프가 작다.
 *
 * 서버 스냅샷은 항상 false 다. 호출부는 false 를 안전한 폴백(모션 없는 정적 레이아웃)으로
 * 다뤄야 하며, 문서 높이를 좌우하는 값이라면 CSS 미디어 쿼리로도 함께 선언해야 한다
 * (예: globals.css 의 `.landing-scene` 트랙 높이 — 조건 문자열이 JS 쪽과 같아야 한다).
 */
export default function useMediaQuery(query: string): boolean {
  const mediaQueryList = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
    return window.matchMedia(query);
  }, [query]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!mediaQueryList) return NOOP_UNSUBSCRIBE;
      mediaQueryList.addEventListener('change', onStoreChange);
      return () => mediaQueryList.removeEventListener('change', onStoreChange);
    },
    [mediaQueryList],
  );

  const getSnapshot = useCallback(() => mediaQueryList?.matches ?? false, [mediaQueryList]);
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
