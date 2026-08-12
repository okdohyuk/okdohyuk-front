'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

/*
 * useDepthNavigation — 플로우 뎁스를 기억하는 앞으로/뒤로 네비게이션.
 *
 * "뒤로" 성격의 버튼(그만두기, 목록으로 등)이 고정 경로 push 를 하면, 사용자가 어디서
 * 진입했든(기록 페이지, 단원 목록, 딥링크) 항상 같은 화면으로 끌려가고 히스토리도
 * 한 겹 더 쌓인다. 이 훅은 앱 내부에서 push 로 들어온 깊이를 탭 단위(sessionStorage)로
 * 세어 두었다가, 뒤로 버튼에서 깊이가 남아 있으면 history.back()(진짜 뒤로가기),
 * 딥링크·새 탭처럼 쌓인 깊이가 없으면 fallback 경로 push 로 동작한다.
 *
 * document.referrer 는 SPA 네비게이션에서 갱신되지 않고, history.length 는 외부 사이트
 * 이력을 포함해 신뢰할 수 없어 자체 카운터를 쓴다. 브라우저 뒤로가기(popstate)로 깊이가
 * 줄면 카운터도 함께 줄여 드리프트를 막는다.
 */

const DEPTH_KEY = 'nav:depth';

function readDepth(): number {
  if (typeof window === 'undefined') return 0;
  const raw = window.sessionStorage.getItem(DEPTH_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function writeDepth(depth: number) {
  window.sessionStorage.setItem(DEPTH_KEY, String(Math.max(0, depth)));
}

export function useDepthNavigation() {
  const router = useRouter();

  // 브라우저 자체 뒤로/앞으로 이동 시 카운터 동기화(뒤로만 감지 가능하므로 감소만 반영).
  React.useEffect(() => {
    const onPopState = () => writeDepth(readDepth() - 1);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // 앞으로(깊이+1) 이동. 뒤로 버튼으로 복귀 가능한 진입은 모두 이걸로 push 한다.
  const pushDeeper = React.useCallback(
    (href: string) => {
      writeDepth(readDepth() + 1);
      router.push(href);
    },
    [router],
  );

  // 뒤로(깊이-1). 내부에서 쌓인 깊이가 없으면(딥링크/새 탭) fallback 으로 push.
  const goBack = React.useCallback(
    (fallback: string) => {
      const depth = readDepth();
      if (depth > 0) {
        writeDepth(depth - 1);
        router.back();
      } else {
        router.push(fallback);
      }
    },
    [router],
  );

  return { pushDeeper, goBack };
}
