'use client';

import React from 'react';
import { observer } from 'mobx-react';
import useStore from '@hooks/useStore';
import useIsClient from '@hooks/useIsClient';

type HomeGateProps = {
  /** 비로그인(그리고 SSR/하이드레이션 이전) 기본 화면 — SEO 대상 랜딩 */
  landing: React.ReactNode;
  /** 로그인 사용자 화면 — 즐겨찾기 홈 */
  favorites: React.ReactNode;
};

/**
 * `/` 홈의 로그인 분기점.
 *
 * 두 화면 모두 서버에서 렌더된 뒤 ReactNode 로 전달되므로, 이 컴포넌트 자체는
 * 클라이언트 번들에서 매우 얇게 유지된다. 서버는 항상 랜딩을 렌더하고
 * (검색엔진/최초 페인트 기준), 하이드레이션 이후 사용자 세션이 확인되면
 * 즐겨찾기 홈으로 교체한다.
 */
function HomeGate({ landing, favorites }: HomeGateProps) {
  const isClient = useIsClient();
  const { user } = useStore('userStore');

  return isClient && user ? favorites : landing;
}

export default observer(HomeGate);
