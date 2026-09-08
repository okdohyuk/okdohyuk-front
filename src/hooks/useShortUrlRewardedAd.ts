'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { prepareRewardedAd, RewardedAdAttempt, RewardedAdStatus } from '@libs/client/rewardedAd';

export function useShortUrlRewardedAd() {
  const unit = process.env.NEXT_PUBLIC_SHORT_URL_REWARDED_AD_UNIT?.trim() ?? '';
  const [status, setStatus] = useState<RewardedAdStatus>('idle');
  const attempt = useRef<RewardedAdAttempt | null>(null);
  const generation = useRef(0);

  const reset = useCallback(() => {
    generation.current += 1;
    attempt.current?.cancel();
    attempt.current = null;
    setStatus('idle');
  }, []);

  const prepare = useCallback(() => {
    generation.current += 1;
    attempt.current?.cancel();
    const currentGeneration = generation.current;
    attempt.current = prepareRewardedAd(unit, (next) => {
      if (generation.current === currentGeneration) setStatus(next);
    });
  }, [unit]);

  const show = useCallback(() => attempt.current?.show(), []);

  useEffect(
    () => () => {
      generation.current += 1;
      attempt.current?.cancel();
      attempt.current = null;
    },
    [],
  );

  return { enabled: Boolean(unit), status, prepare, show, reset };
}
