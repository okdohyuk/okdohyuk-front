'use client';

import { useCallback, useEffect, useState } from 'react';
import type { FavoriteNotice } from '@components/complex/Favorite/FavoriteStarButton';

const DEFAULT_TIMEOUT_MS = 4000;

/**
 * 즐겨찾기 조작 결과 안내 문구를 잠시 보여주고 스스로 지운다.
 *
 * 저장소에 토스트 인프라가 없어 새 패키지 없이 aria-live 인라인 배너로 대체한다.
 * 표시 자체는 `FavoriteNoticeRegion` 이 담당한다.
 */
export default function useFavoriteNotice(timeoutMs = DEFAULT_TIMEOUT_MS) {
  const [notice, setNotice] = useState<FavoriteNotice | null>(null);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), timeoutMs);
    return () => clearTimeout(timer);
  }, [notice, timeoutMs]);

  // 같은 문구가 연달아 발생해도 새 객체를 넣어 타이머가 다시 시작되게 한다.
  const notify = useCallback((next: FavoriteNotice) => setNotice({ ...next }), []);

  return { notice, notify };
}
