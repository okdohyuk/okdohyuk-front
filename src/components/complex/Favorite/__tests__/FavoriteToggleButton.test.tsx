/**
 * FavoriteToggleButton: 도구 즐겨찾기 별 토글 단위 테스트.
 * 즐겨찾기 훅 / MobX 스토어 / i18n / GA 를 mock 해 렌더 게이팅과 토글 분기만 검증한다.
 *
 * 회귀 방지 핵심
 * - 즐겨찾기 API 는 전부 로그인 필수(401)라 비로그인에서는 아무것도 렌더하면 안 된다.
 * - 낙관적 임시 항목(음수 id)으로는 DELETE 를 호출하면 안 된다.
 * - 대문자/쿼리스트링이 섞인 링크는 정규화 후 전송해야 400(pattern) 이 나지 않는다.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FavoriteToggleButton from '../FavoriteToggleButton';

const addMutateMock = vi.fn();
const deleteMutateMock = vi.fn();
const useFavoritesMock = vi.fn();
const useAddFavoriteMock = vi.fn();
const useDeleteFavoriteMock = vi.fn();

vi.mock('@queries/useFavoriteQueries', () => ({
  useFavorites: (enabled?: boolean) => useFavoritesMock(enabled),
  useAddFavorite: () => useAddFavoriteMock(),
  useDeleteFavorite: () => useDeleteFavoriteMock(),
}));

const userStore: { user: { name: string } | null } = { user: { name: '도혁' } };
vi.mock('@hooks/useStore', () => ({
  default: () => userStore,
}));

vi.mock('@libs/client/gtag', () => ({ sendGAEvent: vi.fn() }));

const I18N: Record<string, string> = {
  'toggle.add': '즐겨찾기 추가',
  'toggle.remove': '즐겨찾기 해제',
  'notice.added': '즐겨찾기에 추가했어요',
  'notice.removed': '즐겨찾기에서 뺐어요',
  'error.invalidLink': '이 도구는 즐겨찾기에 추가할 수 없어요',
  'error.duplicate': '이미 즐겨찾기에 있어요',
};

vi.mock('~/app/i18n/client', () => ({
  useTranslation: () => ({
    t: (key: string) => I18N[key] ?? key,
    i18n: { language: 'ko' },
  }),
}));

const favorite = (id: number, toolLink: string, sortOrder: number) => ({
  id,
  toolLink,
  sortOrder,
  createdAt: '2026-08-04T11:55:00',
});

function setup(options: {
  results?: ReturnType<typeof favorite>[];
  addPending?: boolean;
  deletePending?: boolean;
}) {
  const results = options.results ?? [];
  useFavoritesMock.mockReturnValue({ data: { count: results.length, results } });
  useAddFavoriteMock.mockReturnValue({
    mutate: addMutateMock,
    isPending: options.addPending ?? false,
  });
  useDeleteFavoriteMock.mockReturnValue({
    mutate: deleteMutateMock,
    isPending: options.deletePending ?? false,
  });
}

describe('FavoriteToggleButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userStore.user = { name: '도혁' };
  });

  it('비로그인이면 아무것도 렌더하지 않는다', () => {
    userStore.user = null;
    setup({});

    const { container } = render(
      <FavoriteToggleButton lng="ko" toolLink="/server-clock" from="menu" />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(useFavoritesMock).toHaveBeenCalledWith(false);
  });

  it('정규화 불가능한 링크면 아무것도 렌더하지 않는다', () => {
    setup({});

    const { container } = render(
      <FavoriteToggleButton lng="ko" toolLink="https://external.example.com" from="menu" />,
    );

    // 목록 조회 자체는 로그인 여부로만 게이팅한다(useFavoriteToggle 은 부모 단위 훅이라 링크를 모른다).
    // 링크 유효성은 "버튼을 아예 그리지 않는" 것으로 처리한다.
    expect(container).toBeEmptyDOMElement();
    expect(addMutateMock).not.toHaveBeenCalled();
  });

  it('즐겨찾기가 아니면 aria-pressed=false 이고 클릭 시 추가한다', async () => {
    setup({ results: [favorite(1, '/pokemon-type-calculator', 0)] });

    render(<FavoriteToggleButton lng="ko" toolLink="/server-clock" from="menu" />);

    const button = screen.getByRole('button', { name: '즐겨찾기 추가' });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(button);

    expect(addMutateMock).toHaveBeenCalledTimes(1);
    expect(addMutateMock.mock.calls[0][0]).toBe('/server-clock');
    expect(deleteMutateMock).not.toHaveBeenCalled();
  });

  it('대문자·쿼리스트링이 섞인 링크를 정규화해 전송한다', async () => {
    setup({ results: [] });

    render(<FavoriteToggleButton lng="ko" toolLink="/Server-Clock?utm_source=home" from="menu" />);

    await userEvent.click(screen.getByRole('button', { name: '즐겨찾기 추가' }));

    expect(addMutateMock.mock.calls[0][0]).toBe('/server-clock');
  });

  it('이미 즐겨찾기면 aria-pressed=true 이고 클릭 시 해당 id 로 삭제한다', async () => {
    setup({ results: [favorite(7, '/server-clock', 0)] });

    render(<FavoriteToggleButton lng="ko" toolLink="/server-clock" from="menu" />);

    const button = screen.getByRole('button', { name: '즐겨찾기 해제' });
    expect(button).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(button);

    expect(deleteMutateMock).toHaveBeenCalledTimes(1);
    expect(deleteMutateMock.mock.calls[0][0]).toBe(7);
    expect(addMutateMock).not.toHaveBeenCalled();
  });

  it('낙관적 임시 항목(음수 id)이면 비활성화되어 잘못된 DELETE 를 막는다', async () => {
    setup({ results: [favorite(-1754300000000, '/server-clock', 0)] });

    render(<FavoriteToggleButton lng="ko" toolLink="/server-clock" from="menu" />);

    const button = screen.getByRole('button', { name: '즐겨찾기 해제' });
    expect(button).toBeDisabled();

    await userEvent.click(button);
    expect(deleteMutateMock).not.toHaveBeenCalled();
  });

  it('요청 진행 중에는 비활성화해 중복 클릭을 막는다', () => {
    setup({ results: [], addPending: true });

    render(<FavoriteToggleButton lng="ko" toolLink="/server-clock" from="menu" />);

    expect(screen.getByRole('button', { name: '즐겨찾기 추가' })).toBeDisabled();
  });

  it('성공하면 안내 문구를 부모 live region 으로 전달한다', async () => {
    setup({ results: [] });
    addMutateMock.mockImplementation((_link, callbacks) => callbacks.onSuccess?.());
    const onNotice = vi.fn();

    render(
      <FavoriteToggleButton lng="ko" toolLink="/server-clock" from="menu" onNotice={onNotice} />,
    );

    await userEvent.click(screen.getByRole('button', { name: '즐겨찾기 추가' }));

    expect(onNotice).toHaveBeenCalledWith({
      message: '즐겨찾기에 추가했어요',
      tone: 'success',
    });
  });

  it('실패하면 에러 코드에 대응하는 문구를 전달한다 (409 code 57)', async () => {
    setup({ results: [] });
    const duplicateError = {
      isAxiosError: true,
      response: { status: 409, data: { code: 57 } },
    };
    addMutateMock.mockImplementation((_link, callbacks) => callbacks.onError?.(duplicateError));
    const onNotice = vi.fn();

    render(
      <FavoriteToggleButton lng="ko" toolLink="/server-clock" from="menu" onNotice={onNotice} />,
    );

    await userEvent.click(screen.getByRole('button', { name: '즐겨찾기 추가' }));

    expect(onNotice).toHaveBeenCalledWith({ message: '이미 즐겨찾기에 있어요', tone: 'error' });
  });
});
