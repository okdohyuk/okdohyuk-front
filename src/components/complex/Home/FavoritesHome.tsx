'use client';

import React, { useCallback, useMemo, useState } from 'react';
import NextLink from 'next/link';
import { observer } from 'mobx-react';
import { ArrowRight, ChevronDown, ChevronUp, Search, Star, X } from 'lucide-react';
import useStore from '@hooks/useStore';
import useFavoriteNotice from '@hooks/useFavoriteNotice';
import { MenuItem } from '@assets/datas/menus';
import { getServiceMenuItem } from '@assets/datas/landingShowcase';
import { FAVORITE_RECOMMENDED_LINKS } from '@assets/datas/favoriteRecommendations';
import { getServiceCategoryBadge } from '@assets/datas/serviceCategories';
import Skeleton from '@components/basic/Skeleton';
import CursorGlowCard from '@components/complex/Service/CursorGlowCard';
import FavoriteNoticeRegion from '@components/complex/Favorite/FavoriteNoticeRegion';
import FavoriteStarButton from '@components/complex/Favorite/FavoriteStarButton';
import useFavoriteToggle from '@hooks/useFavoriteToggle';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { useAddFavorite, useFavorites, useReorderFavorites } from '@queries/useFavoriteQueries';
import { FAVORITE_MAX_COUNT, getFavoriteErrorKey } from '@libs/client/favoriteError';
import { sendGAEvent } from '@libs/client/gtag';
import { cn } from '@utils/cn';
import { openCommandPalette } from '@utils/commandPalette';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  LANDING_CONTAINER,
  LANDING_CTA_PRIMARY,
  LANDING_CTA_SECONDARY,
  LANDING_EYEBROW,
  LANDING_GLASS_CARD,
} from './Landing/landingStyles';

type FavoritesHomeProps = {
  lng: Language;
};

/** 즐겨찾기 1건 + 메뉴 메타데이터. 메뉴에 없는 링크는 이 단계에서 걸러진다. */
type FavoriteCard = {
  id: number;
  toolLink: string;
  menu: MenuItem;
};

const SKELETON_CARD_COUNT = 6;

/** GA `tool_id` 규격 — MenuDirectoryClient 와 동일하게 선행 슬래시를 제거한다. */
const getToolId = (link: string) => link.replace(/^\//, '') || '/';

/**
 * 로그인 사용자용 즐겨찾기 홈.
 *
 * 목적은 "빠른 접속"이다. 카드 클릭 = 즉시 이동이며, 편집/삭제는 편집 모드 안으로 격리해
 * 평상시 클릭 타깃을 오염시키지 않는다.
 *
 * 렌더 분기는 `HomeGate` 가 담당하므로 이 컴포넌트는 로그인 상태에서만 마운트된다.
 * 서버는 항상 랜딩을 렌더하고 하이드레이션 이후 이 화면으로 교체되므로,
 * 목록 로딩 구간은 스켈레톤으로 채워 레이아웃 점프를 막는다.
 */
function FavoritesHome({ lng }: FavoritesHomeProps) {
  const { t } = useTranslation(lng, 'favorites');
  const { user } = useStore('userStore');
  const { notice, notify } = useFavoriteNotice();
  const [isEditing, setIsEditing] = useState(false);

  const { data, isPending, isError, refetch } = useFavorites();
  const addFavorite = useAddFavorite();
  const reorderFavorites = useReorderFavorites();
  // 카드마다 훅을 구독하지 않도록 해제 토글도 여기서 한 번만 만든다(최대 100장).
  const favoriteToggle = useFavoriteToggle(lng, notify);

  /*
   * 서버는 toolLink 문자열만 보관하고 도구 존재 여부를 검증하지 않는다.
   * 도구 경로가 바뀌거나 도구가 사라지면 매핑에 없는 링크가 남으므로 렌더에서 건너뛴다.
   */
  const cards = useMemo<FavoriteCard[]>(() => {
    if (!data) return [];
    return data.results.reduce<FavoriteCard[]>((acc, favorite) => {
      const menu = getServiceMenuItem(favorite.toolLink);
      if (menu) acc.push({ id: favorite.id, toolLink: favorite.toolLink, menu });
      return acc;
    }, []);
  }, [data]);

  // 추천 목록도 같은 방어 규칙을 적용한다(메뉴에서 사라진 링크는 노출하지 않는다).
  const recommendations = useMemo(
    () =>
      FAVORITE_RECOMMENDED_LINKS.reduce<{ link: string; menu: MenuItem }[]>((acc, link) => {
        const menu = getServiceMenuItem(link);
        if (menu) acc.push({ link, menu });
        return acc;
      }, []),
    [],
  );

  const notifyError = useCallback(
    (error: unknown) => {
      notify({
        message: t(`error.${getFavoriteErrorKey(error)}`, { max: FAVORITE_MAX_COUNT }),
        tone: 'error',
      });
    },
    [notify, t],
  );

  const handleToolOpen = useCallback((toolLink: string, from: string) => {
    sendGAEvent('favorites_tool_open', toolLink, {
      tool_id: getToolId(toolLink),
      tool_link: toolLink,
      from,
    });
  }, []);

  /*
   * 순서 변경은 드래그 없이 위/아래 버튼으로만 처리한다(새 패키지 없이 키보드 접근성 확보).
   *
   * 좌표계가 둘이라는 점이 핵심이다.
   * - `cards`        : 메뉴 매핑에 성공해 **화면에 보이는** 항목 (버튼의 disabled 판정 기준)
   * - `data.results` : 서버가 가진 **전체** 목록 (PUT /favorite/order 가 요구하는 전송 집합)
   * 두 좌표계를 섞으면(예: disabled 는 cards 인덱스, swap 은 results 인덱스) 매핑 실패 항목이
   * 하나라도 있을 때 경계 판정이 어긋나거나 엉뚱한 항목이 움직인다.
   * 따라서 인자는 항상 `cards` 인덱스로 받고, 실제 swap 은 "보이는 이웃"의 위치끼리 맞바꾼다
   * (그 사이에 낀 보이지 않는 항목은 제자리에 남는다). 전송은 전체 집합 그대로다.
   */
  const handleMove = useCallback(
    (cardIndex: number, direction: -1 | 1) => {
      if (!data) return;

      const targetCardIndex = cardIndex + direction;
      if (targetCardIndex < 0 || targetCardIndex >= cards.length) return;

      const ids = data.results.map((favorite) => favorite.id);
      const from = ids.indexOf(cards[cardIndex].id);
      const to = ids.indexOf(cards[targetCardIndex].id);
      if (from < 0 || to < 0) return;

      const next = [...ids];
      [next[from], next[to]] = [next[to], next[from]];

      reorderFavorites.mutate(next, {
        onSuccess: () => {
          sendGAEvent('favorite_reorder', String(next.length), {
            tool_link: cards[cardIndex].toolLink,
            direction: direction === -1 ? 'up' : 'down',
            favorites_count: next.length,
          });
          notify({ message: t('notice.reordered'), tone: 'success' });
        },
        onError: notifyError,
      });
    },
    [cards, data, notify, notifyError, reorderFavorites, t],
  );

  const handleRecommend = useCallback(
    (toolLink: string) => {
      addFavorite.mutate(toolLink, {
        onSuccess: () => {
          sendGAEvent('favorites_recommend_click', toolLink, {
            tool_id: getToolId(toolLink),
            tool_link: toolLink,
          });
          notify({ message: t('notice.added'), tone: 'success' });
        },
        onError: notifyError,
      });
    },
    [addFavorite, notify, notifyError, t],
  );

  const handleEditToggle = useCallback(() => {
    // setState 업데이터는 순수해야 한다(StrictMode/동시 렌더링에서 두 번 호출될 수 있음).
    // GA 발화 같은 부수효과는 업데이터 밖에서 한 번만 수행한다.
    const next = !isEditing;
    setIsEditing(next);
    sendGAEvent('favorite_edit_toggle', next ? 'on' : 'off', { favorites_count: cards.length });
  }, [cards.length, isEditing]);

  const greeting = user?.name
    ? t('home.greeting', { name: user.name })
    : t('home.greetingFallback');

  return (
    <main className="w-full">
      <section
        aria-labelledby="favorites-home-title"
        className={cn(LANDING_CONTAINER, 'py-12 lg:py-16')}
      >
        <div className={cn(LANDING_GLASS_CARD, 'p-6 sm:p-8 lg:p-10')}>
          <p className={LANDING_EYEBROW}>{t('home.eyebrow')}</p>
          <h1
            id="favorites-home-title"
            className="mt-4 text-[clamp(1.7rem,4vw,2.7rem)] font-extrabold leading-[1.1] tracking-[-0.04em] text-fg-1 [word-break:keep-all]"
          >
            {greeting}
          </h1>
          <p className="mt-4 max-w-[46ch] text-base leading-[1.7] text-fg-4 [word-break:keep-all]">
            {t('home.subtitle')}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <NextLink href={`/${lng}/menu`} className={LANDING_CTA_PRIMARY}>
              {t('home.browseAll')}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </NextLink>
            <button type="button" onClick={openCommandPalette} className={LANDING_CTA_SECONDARY}>
              <Search className="h-4 w-4" aria-hidden />
              {t('home.search')}
            </button>
          </div>
        </div>

        <FavoriteNoticeRegion notice={notice} className="mt-4" />

        {isPending ? (
          <div className="mt-8">
            <span className="sr-only">{t('state.loading')}</span>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => index).map((index) => (
                <li key={`favorite-skeleton-${index}`} className="list-none">
                  <Skeleton className="h-[92px] rounded-2xl" />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {isError ? (
          <div className={cn(SERVICE_PANEL_SOFT, 'mt-8 space-y-2 p-6 text-center')}>
            <h2 className="text-base font-bold text-fg-1">{t('state.errorTitle')}</h2>
            <p className="text-sm text-fg-5">{t('state.errorBody')}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className={cn(LANDING_CTA_SECONDARY, 'mt-2')}
            >
              {t('state.retry')}
            </button>
          </div>
        ) : null}

        {!isPending && !isError && cards.length > 0 ? (
          <>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-fg-3">
                {t('home.count', { count: cards.length })}
              </p>
              <button
                type="button"
                onClick={handleEditToggle}
                aria-pressed={isEditing}
                className="inline-flex items-center gap-1.5 rounded-full border border-basic-3 bg-basic-0/70 px-4 py-2 text-xs font-semibold text-fg-3 transition-colors hover:border-point-2/70 hover:text-point-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point-2"
              >
                {isEditing ? (
                  <X className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <Star className="h-3.5 w-3.5" aria-hidden />
                )}
                {isEditing ? t('home.editDone') : t('home.edit')}
              </button>
            </div>

            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card, index) => {
                const title = card.menu.title[lng] || card.menu.title.en;

                return (
                  <li key={card.id} className="list-none">
                    <CursorGlowCard className="h-full">
                      <div
                        className={cn(
                          SERVICE_PANEL_SOFT,
                          SERVICE_CARD_INTERACTIVE,
                          'relative flex h-full flex-col rounded-2xl',
                        )}
                      >
                        <NextLink
                          href={`/${lng}${card.toolLink}`}
                          prefetch
                          onClick={() => handleToolOpen(card.toolLink, 'favorites_home')}
                          className="group flex items-start gap-4 rounded-2xl p-4 pr-14 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point-2"
                        >
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-basic-3 bg-basic-0/90 text-fg-3">
                            {card.menu.icon}
                          </span>
                          <span className="min-w-0 flex-1 space-y-1">
                            <span className="block truncate text-sm font-semibold text-fg-1 md:text-base">
                              {title}
                            </span>
                            <span className="block text-xs font-medium text-fg-5">
                              {getServiceCategoryBadge(lng, card.toolLink)}
                            </span>
                          </span>
                          {/* 우측 슬롯은 별 토글이 쓴다. 화살표를 함께 두면 아이콘이 겹쳐 어수선하다. */}
                        </NextLink>

                        <FavoriteStarButton
                          isFavorite
                          label={favoriteToggle.labels.remove}
                          onToggle={() => favoriteToggle.toggle(card.toolLink, 'favorites_home')}
                          disabled={
                            favoriteToggle.isPending || !favoriteToggle.canToggle(card.toolLink)
                          }
                          className="absolute right-3 top-3"
                        />

                        {isEditing ? (
                          <div className="flex items-center gap-2 border-t border-basic-3/70 px-4 py-3">
                            <button
                              type="button"
                              onClick={() => handleMove(index, -1)}
                              disabled={index === 0 || reorderFavorites.isPending}
                              aria-label={`${t('list.moveUp')} — ${title}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-basic-3 text-fg-4 transition-colors hover:border-point-2/70 hover:text-point-fg disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point-2"
                            >
                              <ChevronUp className="h-4 w-4" aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMove(index, 1)}
                              disabled={index === cards.length - 1 || reorderFavorites.isPending}
                              aria-label={`${t('list.moveDown')} — ${title}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-basic-3 text-fg-4 transition-colors hover:border-point-2/70 hover:text-point-fg disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point-2"
                            >
                              <ChevronDown className="h-4 w-4" aria-hidden />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </CursorGlowCard>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}

        {!isPending && !isError && cards.length === 0 ? (
          <div className={cn(SERVICE_PANEL_SOFT, 'mt-8 space-y-6 p-6 sm:p-8')}>
            <div className="space-y-2">
              <h2 className="text-lg font-extrabold text-fg-1 [word-break:keep-all]">
                {t('empty.title')}
              </h2>
              <p className="max-w-[52ch] text-sm leading-[1.7] text-fg-4 [word-break:keep-all]">
                {t('empty.body')}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-fg-3">{t('empty.recommendTitle')}</h3>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map(({ link, menu }) => {
                  const title = menu.title[lng] || menu.title.en;

                  return (
                    <li key={link} className="list-none">
                      <div className="relative flex items-start gap-3 rounded-2xl border border-basic-3/70 bg-basic-0/70 p-4 pr-14">
                        <NextLink
                          href={`/${lng}${link}`}
                          prefetch={false}
                          onClick={() => handleToolOpen(link, 'favorites_empty')}
                          className="group flex min-w-0 flex-1 items-start gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point-2"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-basic-3 bg-basic-0/90 text-fg-3">
                            {menu.icon}
                          </span>
                          <span className="min-w-0 flex-1 space-y-1">
                            <span className="block truncate text-sm font-semibold text-fg-1">
                              {title}
                            </span>
                            <span className="block text-xs font-medium text-fg-5">
                              {getServiceCategoryBadge(lng, link)}
                            </span>
                          </span>
                        </NextLink>
                        <button
                          type="button"
                          onClick={() => handleRecommend(link)}
                          disabled={addFavorite.isPending}
                          aria-label={`${t('empty.add')} — ${title}`}
                          className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-basic-3 bg-basic-0/90 text-fg-5 transition-colors hover:border-point-2/70 hover:text-point-fg disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point-2"
                        >
                          <Star className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default observer(FavoritesHome);
