/**
 * FavoritesHome: 로그인 사용자용 즐겨찾기 홈 렌더 테스트.
 * 즐겨찾기 훅 / MobX 스토어 / i18n / GA / 커맨드 팔레트를 mock 하고,
 * `menus.tsx` 기반 링크→도구 매핑은 실제 데이터를 그대로 쓴다(스킵 방어의 진짜 동작을 검증하기 위함).
 *
 * 회귀 방지 핵심
 * - 서버는 toolLink 문자열만 보관하므로 메뉴에 없는 링크는 반드시 렌더에서 스킵되어야 한다.
 * - 순서 변경은 화면에 보이는 카드가 아니라 "서버 전체 목록" 기준 id 배열로 보내야 400(code 59)이 안 난다.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FavoritesHome from '../FavoritesHome';

const refetchMock = vi.fn();
const reorderMutateMock = vi.fn();
const addMutateMock = vi.fn();
const useFavoritesMock = vi.fn();

vi.mock('@queries/useFavoriteQueries', () => ({
  useFavorites: () => useFavoritesMock(),
  useAddFavorite: () => ({ mutate: addMutateMock, isPending: false }),
  useReorderFavorites: () => ({ mutate: reorderMutateMock, isPending: false }),
  useDeleteFavorite: () => ({ mutate: vi.fn(), isPending: false }),
}));

/*
 * 별 토글은 FavoriteToggleButton.test.tsx 가 담당한다. 여기서는 렌더 구조만 본다.
 * FavoritesHome 은 카드마다 훅을 구독하지 않도록 `useFavoriteToggle` 을 한 번만 호출하고
 * 표시 전용 `FavoriteStarButton` 을 렌더한다 — 그 훅이 쓰는 의존성은 위/아래 mock 으로 이미 덮여 있어
 * 별도 mock 없이 실제 코드가 그대로 돌아간다.
 */

vi.mock('@hooks/useStore', () => ({
  default: () => ({ user: { name: '도혁' } }),
}));

vi.mock('@libs/client/gtag', () => ({ sendGAEvent: vi.fn() }));
vi.mock('@utils/commandPalette', () => ({ openCommandPalette: vi.fn() }));

const I18N: Record<string, string> = {
  'home.eyebrow': 'MY TOOLS',
  'home.greeting': '{{name}} 님의 도구',
  'home.greetingFallback': '내 도구',
  'home.subtitle': '자주 쓰는 도구를 모아뒀어요',
  'home.count': '{{count}}개',
  'home.browseAll': '전체 도구 보기',
  'home.search': '검색',
  'home.edit': '편집',
  'home.editDone': '편집 완료',
  'toggle.add': '즐겨찾기 추가',
  'toggle.remove': '즐겨찾기 해제',
  'list.moveUp': '위로 이동',
  'list.moveDown': '아래로 이동',
  'empty.title': '아직 즐겨찾기가 없어요',
  'empty.body': '자주 쓰는 도구를 별로 저장해 보세요',
  'empty.recommendTitle': '이런 도구는 어때요',
  'empty.add': '추가',
  'state.loading': '즐겨찾기를 불러오는 중',
  'state.errorTitle': '불러오지 못했어요',
  'state.errorBody': '잠시 후 다시 시도해 주세요',
  'state.retry': '다시 시도',
  'notice.reordered': '순서를 저장했어요',
  'notice.added': '즐겨찾기에 추가했어요',
};

vi.mock('~/app/i18n/client', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      const template = I18N[key] ?? key;
      if (!options) return template;
      return template.replace(/{{(\w+)}}/g, (_match, name: string) => String(options[name] ?? ''));
    },
    i18n: { language: 'ko' },
  }),
}));

const favorite = (id: number, toolLink: string, sortOrder: number) => ({
  id,
  toolLink,
  sortOrder,
  createdAt: '2026-08-04T11:55:00',
});

function setQueryState(state: {
  results?: ReturnType<typeof favorite>[];
  isPending?: boolean;
  isError?: boolean;
}) {
  const { results } = state;
  useFavoritesMock.mockReturnValue({
    data: results ? { count: results.length, results } : undefined,
    isPending: state.isPending ?? false,
    isError: state.isError ?? false,
    refetch: refetchMock,
  });
}

describe('FavoritesHome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('사용자 이름으로 인사한다', () => {
    setQueryState({ results: [] });

    render(<FavoritesHome lng="ko" />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('도혁 님의 도구');
  });

  it('로딩 중에는 스켈레톤과 sr-only 로딩 문구를 보여준다', () => {
    setQueryState({ isPending: true });

    const { container } = render(<FavoritesHome lng="ko" />);

    expect(screen.getByText('즐겨찾기를 불러오는 중')).toBeInTheDocument();
    // 스켈레톤 6칸(SKELETON_CARD_COUNT)
    expect(container.querySelectorAll('li.list-none')).toHaveLength(6);
    expect(screen.queryByText('아직 즐겨찾기가 없어요')).not.toBeInTheDocument();
  });

  it('에러 상태에서는 재시도 버튼이 refetch 를 호출한다', async () => {
    setQueryState({ isError: true });

    render(<FavoritesHome lng="ko" />);

    expect(screen.getByText('불러오지 못했어요')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it('빈 상태에서는 안내 문구와 추천 도구를 보여준다', () => {
    setQueryState({ results: [] });

    render(<FavoritesHome lng="ko" />);

    expect(screen.getByText('아직 즐겨찾기가 없어요')).toBeInTheDocument();
    expect(screen.getByText('이런 도구는 어때요')).toBeInTheDocument();
    // 추천 6종 각각에 "추가" 버튼
    expect(screen.getAllByRole('button', { name: /^추가 — / })).toHaveLength(6);
  });

  it('추천 도구의 추가 버튼은 해당 링크로 addFavorite 를 호출한다', async () => {
    setQueryState({ results: [] });

    render(<FavoritesHome lng="ko" />);

    const [firstAdd] = screen.getAllByRole('button', { name: /^추가 — / });
    await userEvent.click(firstAdd);

    expect(addMutateMock).toHaveBeenCalledTimes(1);
    expect(addMutateMock.mock.calls[0][0]).toBe('/pokemon-type-calculator');
  });

  it('즐겨찾기 카드 그리드를 렌더하고 개수를 표시한다', () => {
    setQueryState({
      results: [favorite(1, '/pokemon-type-calculator', 0), favorite(2, '/server-clock', 1)],
    });

    const { container } = render(<FavoritesHome lng="ko" />);

    expect(screen.getByText('2개')).toBeInTheDocument();
    expect(container.querySelector('a[href="/ko/pokemon-type-calculator"]')).not.toBeNull();
    expect(container.querySelector('a[href="/ko/server-clock"]')).not.toBeNull();
    // 카드마다 해제용 별 토글이 하나씩 붙는다.
    expect(screen.getAllByRole('button', { name: '즐겨찾기 해제' })).toHaveLength(2);
    expect(screen.queryByText('아직 즐겨찾기가 없어요')).not.toBeInTheDocument();
  });

  it('카드 우측 아이콘은 별 토글 하나뿐이다(이동 화살표를 함께 그리지 않는다)', () => {
    setQueryState({ results: [favorite(1, '/pokemon-type-calculator', 0)] });

    const { container } = render(<FavoritesHome lng="ko" />);

    const card = container.querySelector('a[href="/ko/pokemon-type-calculator"]');
    expect(card).not.toBeNull();
    // 장식용 화살표와 조작 버튼이 한 모서리에 겹치면 어수선하다 — 링크 안에는 아이콘을 두지 않는다.
    expect(card?.querySelector('.lucide-arrow-up-right')).toBeNull();
    expect(screen.getAllByRole('button', { name: '즐겨찾기 해제' })).toHaveLength(1);
  });

  it('메뉴에 없는 toolLink 는 렌더에서 스킵한다', () => {
    setQueryState({
      results: [
        favorite(1, '/pokemon-type-calculator', 0),
        favorite(2, '/deleted-tool-that-no-longer-exists', 1),
        favorite(3, '/server-clock', 2),
      ],
    });

    const { container } = render(<FavoritesHome lng="ko" />);

    expect(container.querySelector('a[href="/ko/pokemon-type-calculator"]')).not.toBeNull();
    expect(container.querySelector('a[href="/ko/server-clock"]')).not.toBeNull();
    expect(container.querySelector('a[href="/ko/deleted-tool-that-no-longer-exists"]')).toBeNull();
    // 렌더 가능한 카드만 세어야 한다(서버 3건 → 화면 2건)
    expect(screen.getByText('2개')).toBeInTheDocument();
  });

  it('스킵된 항목이 있어도 순서 변경은 서버 전체 목록 기준 id 배열을 보낸다', async () => {
    setQueryState({
      results: [
        favorite(1, '/pokemon-type-calculator', 0),
        favorite(2, '/deleted-tool-that-no-longer-exists', 1),
        favorite(3, '/server-clock', 2),
      ],
    });

    render(<FavoritesHome lng="ko" />);
    await userEvent.click(screen.getByRole('button', { name: '편집' }));

    const moveDown = screen.getAllByRole('button', { name: /^아래로 이동 — / })[0];
    await userEvent.click(moveDown);

    expect(reorderMutateMock).toHaveBeenCalledTimes(1);
    /*
     * 전송은 화면에 없는 id 2 까지 포함한 전체 집합이어야 400(code 59)을 피한다.
     * 그리고 "아래로"는 **보이는 이웃**(id 1 ↔ id 3)과 자리를 바꿔야 실제로 순서가 바뀐다.
     * 서버 인덱스로 인접한 1↔2 를 바꾸면([2,1,3]) 보이는 순서는 그대로라 버튼이 먹통이 된다.
     */
    expect(reorderMutateMock.mock.calls[0][0]).toEqual([3, 2, 1]);
  });

  it('편집 모드에서만 이동 버튼이 나타나고 양 끝은 비활성화된다', async () => {
    setQueryState({
      results: [favorite(1, '/pokemon-type-calculator', 0), favorite(2, '/server-clock', 1)],
    });

    render(<FavoritesHome lng="ko" />);
    expect(screen.queryByRole('button', { name: /^위로 이동 — / })).toBeNull();

    const editButton = screen.getByRole('button', { name: '편집' });
    expect(editButton).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(editButton);

    const upButtons = screen.getAllByRole('button', { name: /^위로 이동 — / });
    const downButtons = screen.getAllByRole('button', { name: /^아래로 이동 — / });
    expect(upButtons).toHaveLength(2);
    expect(upButtons[0]).toBeDisabled();
    expect(upButtons[1]).toBeEnabled();
    expect(downButtons[0]).toBeEnabled();
    expect(downButtons[1]).toBeDisabled();

    expect(screen.getByRole('button', { name: '편집 완료' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('카드는 언어 프리픽스가 붙은 도구 경로로 링크한다', () => {
    setQueryState({ results: [favorite(1, '/server-clock', 0)] });

    render(<FavoritesHome lng="ja" />);

    const list = screen.getByRole('list');
    const link = within(list).getAllByRole('link')[0];
    expect(link).toHaveAttribute('href', '/ja/server-clock');
  });

  it('안내 문구는 aria-live 영역에 표시된다', async () => {
    setQueryState({ results: [favorite(1, '/pokemon-type-calculator', 0)] });
    reorderMutateMock.mockImplementation((_ids, callbacks) => callbacks.onSuccess?.());

    render(<FavoritesHome lng="ko" />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });
});
