/**
 * HomeGate: `/` 홈의 로그인 분기점 렌더 테스트.
 *
 * 회귀 방지 핵심
 * - 서버(=하이드레이션 이전)는 항상 랜딩을 렌더해야 SSR 결과와 일치하고 무플래시가 보장된다.
 *   따라서 user 가 이미 스토어에 있어도 `useIsClient()` 가 false 인 첫 렌더에서는 랜딩이어야 한다.
 * - 하이드레이션 이후에만 user 유무로 랜딩/즐겨찾기가 갈린다.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { UserStoreState } from '@stores/UserStore/type';

import HomeGate from '../HomeGate';

/** null 이면 실제 useIsClient 동작(하이드레이션 후 true), boolean 이면 해당 값으로 고정 */
let isClientOverride: boolean | null = null;
let userStoreStub: UserStoreState;

vi.mock('@hooks/useIsClient', async () => {
  const actual = await vi.importActual<typeof import('@hooks/useIsClient')>('@hooks/useIsClient');
  return {
    default: () => {
      // 훅 호출 순서를 보존하기 위해 실제 훅은 항상 호출하고 필요할 때만 값을 덮어쓴다.
      const real = actual.default();
      return isClientOverride === null ? real : isClientOverride;
    },
  };
});

vi.mock('@hooks/useStore', () => ({
  default: () => userStoreStub,
}));

const createUserStore = (user: UserStoreState['user']): UserStoreState => ({
  user,
  setUser: vi.fn(),
  logOut: vi.fn(),
  logOutAll: vi.fn(),
});

const LANDING = <div>landing-screen</div>;
const FAVORITES = <div>favorites-screen</div>;

const renderGate = () => render(<HomeGate landing={LANDING} favorites={FAVORITES} />);

describe('<HomeGate />', () => {
  beforeEach(() => {
    isClientOverride = null;
    userStoreStub = createUserStore(null);
  });

  it('renders landing after hydration when there is no user', () => {
    renderGate();

    expect(screen.getByText('landing-screen')).toBeInTheDocument();
    expect(screen.queryByText('favorites-screen')).not.toBeInTheDocument();
  });

  it('renders favorites after hydration when a user exists', () => {
    userStoreStub = createUserStore({ name: '도혁' } as UserStoreState['user']);

    renderGate();

    expect(screen.getByText('favorites-screen')).toBeInTheDocument();
    expect(screen.queryByText('landing-screen')).not.toBeInTheDocument();
  });

  it('renders landing before hydration even when a user exists', () => {
    isClientOverride = false;
    userStoreStub = createUserStore({ name: '도혁' } as UserStoreState['user']);

    renderGate();

    expect(screen.getByText('landing-screen')).toBeInTheDocument();
    expect(screen.queryByText('favorites-screen')).not.toBeInTheDocument();
  });
});
