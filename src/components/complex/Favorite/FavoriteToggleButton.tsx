/* eslint-disable react/require-default-props */

'use client';

import React from 'react';
import { observer } from 'mobx-react';
import useFavoriteToggle from '@hooks/useFavoriteToggle';
import { normalizeToolLink } from '@libs/client/favoriteError';
import { Language } from '~/app/i18n/settings';
import FavoriteStarButton, { type FavoriteNotice } from './FavoriteStarButton';

type FavoriteToggleButtonProps = {
  lng: Language;
  /** 도구 경로. 대문자/쿼리스트링이 섞여 있어도 내부에서 정규화한다. */
  toolLink: string;
  /** GA4 `from` 파라미터 (예: 'menu', 'favorites_home') */
  from: string;
  className?: string;
  /** 결과 안내 문구를 부모의 live region 에 전달한다. */
  onNotice?: (notice: FavoriteNotice) => void;
};

/**
 * 자기 완결형 즐겨찾기 별 토글(데이터 구독 포함).
 *
 * 한 화면에 소수만 놓이는 곳(즐겨찾기 홈 카드 등)에서 쓴다.
 * `/menu` 처럼 수십 개를 렌더하는 화면은 부모가 `useFavoriteToggle` 을 한 번만 호출하고
 * 표시 전용 `FavoriteStarButton` 을 직접 쓰는 편이 낫다(구독 수 폭증 방지).
 *
 * 즐겨찾기 API 는 전부 로그인 필수(401)라 비로그인/하이드레이션 이전에는 아무것도 렌더하지 않는다.
 */
function FavoriteToggleButton({
  lng,
  toolLink,
  from,
  className,
  onNotice,
}: FavoriteToggleButtonProps) {
  const favorite = useFavoriteToggle(lng, onNotice);

  // 비로그인이거나 즐겨찾기가 불가능한 경로(외부 링크 등)면 눌러도 소용없는 버튼을 만들지 않는다.
  if (!favorite.enabled || normalizeToolLink(toolLink) === null) return null;

  const isFavorite = favorite.isFavorite(toolLink);

  return (
    <FavoriteStarButton
      isFavorite={isFavorite}
      label={isFavorite ? favorite.labels.remove : favorite.labels.add}
      onToggle={() => favorite.toggle(toolLink, from)}
      disabled={favorite.isPending || !favorite.canToggle(toolLink)}
      className={className}
    />
  );
}

export default observer(FavoriteToggleButton);
