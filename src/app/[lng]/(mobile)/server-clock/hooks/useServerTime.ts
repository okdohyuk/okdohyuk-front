'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

export function useServerTime(lng: Language, selectedSite: string, customServerUrl: string) {
  const { t } = useTranslation(lng, 'server-clock');
  const [serverTime, setServerTime] = useState<Date | null>(null);
  const [timeOffset, setTimeOffset] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServerTime = async () => {
      if (selectedSite === 'custom' && !customServerUrl) {
        setIsLoading(false);
        setServerTime(null); // 이전 시간 값 제거
        setError(null); // 이전 에러 제거
        return;
      }

      setIsLoading(true);
      setError(null); // 새 요청 시 에러 리셋

      try {
        const apiUrl =
          selectedSite === 'custom'
            ? `/api/server-time?site=${encodeURIComponent(customServerUrl)}`
            : `/api/server-time?site=${selectedSite}`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch server time');
        }
        const data = await response.json();
        const serverNow = new Date(data.serverTime);
        const clientNow = new Date();
        setTimeOffset(serverNow.getTime() - clientNow.getTime());
        setServerTime(serverNow);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(t('error', { message }));
        setServerTime(null); // 에러 발생 시 시간 값 제거
        setTimeOffset(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServerTime();
  }, [selectedSite, customServerUrl, t]);

  useEffect(() => {
    // 오프셋이 있고 로딩 중이 아닐 때만 타이머를 실행합니다.
    if (timeOffset === 0 && !isLoading && !serverTime) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      const clientNow = new Date();
      setServerTime(new Date(clientNow.getTime() + timeOffset));
    }, 50);

    return () => window.clearInterval(timer);
  }, [timeOffset, isLoading, serverTime]);

  return { serverTime, isLoading, error, setTimeOffset, setServerTime, setError, setIsLoading };
}
