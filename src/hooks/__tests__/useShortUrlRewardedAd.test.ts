import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { prepareRewardedAd, RewardedAdStatus } from '@libs/client/rewardedAd';
import { useShortUrlRewardedAd } from '../useShortUrlRewardedAd';

vi.mock('@libs/client/rewardedAd', () => ({ prepareRewardedAd: vi.fn() }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('useShortUrlRewardedAd', () => {
  it('is disabled when no unit is configured and does not load ads', () => {
    vi.stubEnv('NEXT_PUBLIC_SHORT_URL_REWARDED_AD_UNIT', '');
    const { result } = renderHook(useShortUrlRewardedAd);
    expect(result.current.enabled).toBe(false);
    expect(prepareRewardedAd).not.toHaveBeenCalled();
  });

  it('ignores late callbacks from an attempt after reset', () => {
    vi.stubEnv('NEXT_PUBLIC_SHORT_URL_REWARDED_AD_UNIT', '/123/reward');
    let notify: (status: RewardedAdStatus) => void = () => undefined;
    const cancel = vi.fn();
    vi.mocked(prepareRewardedAd).mockImplementation((_unit, onStatus) => {
      notify = onStatus;
      onStatus('loading');
      return { show: vi.fn(), cancel };
    });
    const { result } = renderHook(useShortUrlRewardedAd);
    act(() => result.current.prepare());
    expect(result.current.status).toBe('loading');
    act(() => result.current.reset());
    act(() => notify('granted'));
    expect(result.current.status).toBe('idle');
    expect(cancel).toHaveBeenCalledOnce();
  });

  it('cancels its attempt on unmount', () => {
    vi.stubEnv('NEXT_PUBLIC_SHORT_URL_REWARDED_AD_UNIT', '/123/reward');
    const cancel = vi.fn();
    vi.mocked(prepareRewardedAd).mockReturnValue({ show: vi.fn(), cancel });
    const { result, unmount } = renderHook(useShortUrlRewardedAd);
    act(() => result.current.prepare());
    unmount();
    expect(cancel).toHaveBeenCalledOnce();
  });
});
