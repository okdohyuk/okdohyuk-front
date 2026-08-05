'use client';

import { useCallback, useMemo } from 'react';
import useIsClient from '@hooks/useIsClient';
import useStore from '@hooks/useStore';
import { useAddFavorite, useDeleteFavorite, useFavorites } from '@queries/useFavoriteQueries';
import {
  FAVORITE_MAX_COUNT,
  getFavoriteErrorKey,
  normalizeToolLink,
} from '@libs/client/favoriteError';
import { sendGAEvent } from '@libs/client/gtag';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import type { FavoriteNotice } from '@components/complex/Favorite/FavoriteStarButton';

export type FavoriteToggleApi = {
  /** 로그인 + 하이드레이션 완료 시에만 true. false 면 토글 UI 를 렌더하지 않는다. */
  enabled: boolean;
  isPending: boolean;
  /** 즐겨찾기 여부. 등록되지 않았거나 경로가 부적합하면 false. */
  isFavorite: (toolLink: string) => boolean;
  /** 지금 토글을 눌러도 되는지. 낙관적 임시 항목(음수 id)은 해제 불가라 false. */
  canToggle: (toolLink: string) => boolean;
  toggle: (toolLink: string, from: string) => void;
  labels: { add: string; remove: string };
};

/**
 * 즐겨찾기 별 토글의 데이터/동작을 한 곳에 모은 훅.
 *
 * `/menu` 는 도구 항목이 50개 남짓이라 항목마다 쿼리·뮤테이션 훅을 구독하면
 * 같은 캐시를 향한 구독자가 그 수만큼 늘어난다. 부모가 이 훅을 **한 번만** 호출하고
 * 자식(`FavoriteStarButton`)은 표시용 props 만 받도록 분리하기 위해 존재한다.
 *
 * MobX `userStore` 를 읽으므로 호출하는 컴포넌트는 `observer` 여야 한다.
 */
export default function useFavoriteToggle(
  lng: Language,
  onNotice?: (notice: FavoriteNotice) => void,
): FavoriteToggleApi {
  const { t } = useTranslation(lng, 'favorites');
  const isClient = useIsClient();
  const { user } = useStore('userStore');

  const enabled = isClient && !!user;

  const { data } = useFavorites(enabled);
  const addFavorite = useAddFavorite();
  const deleteFavorite = useDeleteFavorite();

  /** 정규화된 toolLink → 즐겨찾기 id. 해제 시 PK 가 필요해 역인덱스를 만들어 둔다. */
  const idByToolLink = useMemo(() => {
    const map = new Map<string, number>();
    data?.results.forEach((favorite) => map.set(favorite.toolLink, favorite.id));
    return map;
  }, [data]);

  const isFavorite = useCallback(
    (toolLink: string) => {
      const normalized = normalizeToolLink(toolLink);
      return normalized !== null && idByToolLink.has(normalized);
    },
    [idByToolLink],
  );

  const canToggle = useCallback(
    (toolLink: string) => {
      const normalized = normalizeToolLink(toolLink);
      if (normalized === null) return false;
      const id = idByToolLink.get(normalized);
      // 아직 서버 확정 전(음수 임시 id)인 항목은 잘못된 id 로 DELETE 하지 않도록 잠근다.
      return id === undefined || id > 0;
    },
    [idByToolLink],
  );

  const notifyError = useCallback(
    (error: unknown) => {
      onNotice?.({
        message: t(`error.${getFavoriteErrorKey(error)}`, { max: FAVORITE_MAX_COUNT }),
        tone: 'error',
      });
    },
    [onNotice, t],
  );

  const toggle = useCallback(
    (toolLink: string, from: string) => {
      const normalized = normalizeToolLink(toolLink);
      if (normalized === null) {
        onNotice?.({ message: t('error.invalidLink'), tone: 'error' });
        return;
      }

      const id = idByToolLink.get(normalized);

      if (id !== undefined) {
        if (id <= 0) return;
        deleteFavorite.mutate(id, {
          onSuccess: () => {
            sendGAEvent('favorite_remove', normalized, { tool_link: normalized, from });
            onNotice?.({ message: t('notice.removed'), tone: 'success' });
          },
          onError: notifyError,
        });
        return;
      }

      addFavorite.mutate(normalized, {
        onSuccess: () => {
          sendGAEvent('favorite_add', normalized, { tool_link: normalized, from });
          onNotice?.({ message: t('notice.added'), tone: 'success' });
        },
        onError: notifyError,
      });
    },
    [addFavorite, deleteFavorite, idByToolLink, notifyError, onNotice, t],
  );

  const labels = useMemo(() => ({ add: t('toggle.add'), remove: t('toggle.remove') }), [t]);

  return {
    enabled,
    isPending: addFavorite.isPending || deleteFavorite.isPending,
    isFavorite,
    canToggle,
    toggle,
    labels,
  };
}
