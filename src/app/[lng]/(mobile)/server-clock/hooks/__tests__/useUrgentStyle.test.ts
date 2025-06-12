import { renderHook, waitFor } from '@testing-library/react';
import { useUrgentStyle } from '../useUrgentStyle';

describe('useUrgentStyle Hook', () => {
  it('should return default style when serverTime is null', () => {
    const { result } = renderHook(() => useUrgentStyle(null));
    expect(result.current).toEqual({ color: 'inherit', scale: 1 });
  });

  it('should return default style for non-urgent times', () => {
    // 10:58:30 (긴급하지 않은 시간)
    const nonUrgentTime = new Date(2023, 10, 10, 10, 58, 30);
    const { result } = renderHook(() => useUrgentStyle(nonUrgentTime));
    expect(result.current).toEqual({ color: 'inherit', scale: 1 });
  });

  it('should change style for urgent times', async () => {
    // 10:59:55
    const urgentTime = new Date(2023, 10, 10, 10, 59, 55);
    const { result } = renderHook(() => useUrgentStyle(urgentTime));
    await waitFor(() => {
      expect(result.current.color).not.toBe('inherit');
      // expect(result.current.scale).toBeGreaterThan(1);
    });
  });

  it('should update style as time progresses', async () => {
    // 10:59:49
    let initialTime = new Date(2023, 10, 10, 10, 59, 49);

    const { result, rerender } = renderHook(({ time }) => useUrgentStyle(time), {
      initialProps: { time: initialTime },
    });

    // 초기 상태: 긴급하지 않음
    expect(result.current).toEqual({ color: 'inherit', scale: 1 });

    // 1초 후 (59분 50초) - 긴급 상태로 진입
    initialTime = new Date(initialTime.getTime() + 1000);
    rerender({ time: initialTime });
    await waitFor(() => {
      expect(result.current.color).not.toBe('inherit');
      // expect(result.current.scale).toBeGreaterThan(1);
    });

    // 10초 후 (00분 00초) - 긴급 상태 해제
    initialTime = new Date(initialTime.getTime() + 10000);
    rerender({ time: initialTime });
    await waitFor(() => {
      expect(result.current).toEqual({ color: 'inherit', scale: 1 });
    });
  });
});
