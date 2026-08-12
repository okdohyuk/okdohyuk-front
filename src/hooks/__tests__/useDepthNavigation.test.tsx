/**
 * useDepthNavigation: 플로우 뎁스 기반 뒤로가기 훅 테스트.
 *
 * 회귀 방지 핵심
 * - pushDeeper 로 쌓인 깊이가 있으면 goBack 은 router.back()(진짜 뒤로가기)이어야 한다.
 *   고정 경로 push 로 돌아가면 "그만두기가 메뉴로 이동" 버그가 재발한다.
 * - 딥링크/새 탭(깊이 0)에서는 back 대신 fallback push 여야 한다(외부 사이트로 이탈 방지).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useDepthNavigation } from '../useDepthNavigation';

const pushMock = vi.fn();
const backMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, back: backMock }),
}));

describe('useDepthNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });

  it('깊이가 없으면(딥링크) goBack 은 fallback 으로 push 한다', () => {
    const { result } = renderHook(() => useDepthNavigation());
    act(() => result.current.goBack('/ko/solve'));
    expect(pushMock).toHaveBeenCalledWith('/ko/solve');
    expect(backMock).not.toHaveBeenCalled();
  });

  it('pushDeeper 로 들어온 뒤 goBack 은 router.back() 으로 복귀한다', () => {
    const { result } = renderHook(() => useDepthNavigation());
    act(() => result.current.pushDeeper('/ko/solve/pilgi/quiz'));
    act(() => result.current.goBack('/ko/solve/pilgi'));
    expect(backMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledTimes(1); // pushDeeper 의 push 만
    expect(pushMock).toHaveBeenCalledWith('/ko/solve/pilgi/quiz');
  });

  it('깊이를 소진하면 다시 fallback push 로 동작한다', () => {
    const { result } = renderHook(() => useDepthNavigation());
    act(() => result.current.pushDeeper('/ko/solve/pilgi'));
    act(() => result.current.goBack('/ko/solve'));
    act(() => result.current.goBack('/ko/solve'));
    expect(backMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenLastCalledWith('/ko/solve');
  });

  it('브라우저 뒤로가기(popstate)도 깊이를 감소시킨다', () => {
    const { result } = renderHook(() => useDepthNavigation());
    act(() => result.current.pushDeeper('/ko/solve/pilgi'));
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    act(() => result.current.goBack('/ko/solve'));
    expect(backMock).not.toHaveBeenCalled();
    expect(pushMock).toHaveBeenLastCalledWith('/ko/solve');
  });
});
