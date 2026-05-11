'use client';

import React, { useEffect, useRef, useState } from 'react';
import { sendGAEvent } from '@libs/client/gtag';
import { useToolTracking } from '@hooks/analytics/useToolTracking';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import { getServiceCategoryBadge } from '@assets/datas/serviceCategories';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { useServerTime } from '../hooks/useServerTime';
import { useUrgentStyle } from '../hooks/useUrgentStyle';
import { TICKETING_SITES } from '../lib/constants'; // TICKETING_SITES는 SiteSelectionButtons 내부에서 사용되므로 Clock.tsx에서는 제거해도 됩니다.
import { getHostname } from '../lib/utils';
import SiteSelectionButtons from './SiteSelectionButtons';
import CustomUrlInput from './CustomUrlInput';
import TimeDisplay from './TimeDisplay';
import DisplaySettings from './DisplaySettings';

interface ClockProps {
  lng: Language;
}

export default function Clock({ lng }: ClockProps) {
  const { t } = useTranslation(lng, 'server-clock');
  const badge = getServiceCategoryBadge(lng, '/server-clock');
  const [selectedSite, setSelectedSite] = useState(TICKETING_SITES[0]);
  const [customServerUrl, setCustomServerUrl] = useState<string>('');
  const [inputCustomUrl, setInputCustomUrl] = useState<string>('');
  const [showMilliseconds, setShowMilliseconds] = useState(true);
  const { trackInputStarted, trackUse } = useToolTracking('server-clock', 'utility');

  const { serverTime, isLoading, error, setTimeOffset, setServerTime, setError, setIsLoading } =
    useServerTime(lng, selectedSite, customServerUrl);
  const urgentStyle = useUrgentStyle(serverTime);

  // 세션 추적: 컴포넌트 마운트 시 시작, 언마운트 시 종료
  const sessionStartRef = useRef<number | null>(null);
  useEffect(() => {
    sessionStartRef.current = Date.now();
    sendGAEvent('tool_session_start', 'server-clock', {
      tool_id: 'server-clock',
      tool_category: 'utility',
    });
    return () => {
      const startedAt = sessionStartRef.current;
      if (startedAt) {
        sendGAEvent('tool_session_end', 'server-clock', {
          tool_id: 'server-clock',
          tool_category: 'utility',
          duration_sec: Math.floor((Date.now() - startedAt) / 1000),
        });
      }
    };
  }, []);

  const handleSiteSelection = (site: string) => {
    if (selectedSite === site && site !== 'custom') return;

    setIsLoading(true);
    setError(null);
    setServerTime(null);
    setTimeOffset(0);

    setSelectedSite(site);
    trackUse({ action_type: 'select_site', success: true });

    if (site === 'custom') {
      setCustomServerUrl('');
      setInputCustomUrl('');
    }
  };

  const handleCustomUrlFetch = () => {
    if (inputCustomUrl) {
      // URL에서 프로토콜을 제거하고 저장
      const cleanUrl = inputCustomUrl.replace(/^https?:\/\//, '');
      setCustomServerUrl(`https://${cleanUrl}`);
      trackUse({ action_type: 'fetch_custom_url', success: true });
    }
  };

  const wrappedSetInputCustomUrl = (url: string) => {
    trackInputStarted();
    setInputCustomUrl(url);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-220px)] w-full max-w-4xl flex-col justify-center gap-4 text-center">
      <ServicePageHeader title={t('title')} description={t('availableSites')} badge={badge} />

      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <SiteSelectionButtons
          selectedSite={selectedSite}
          isLoading={isLoading}
          handleSiteSelection={handleSiteSelection}
          t={t}
        />

        {selectedSite === 'custom' && (
          <CustomUrlInput
            inputCustomUrl={inputCustomUrl}
            setInputCustomUrl={wrappedSetInputCustomUrl}
            isLoading={isLoading}
            handleCustomUrlFetch={handleCustomUrlFetch}
            t={t}
          />
        )}

        <TimeDisplay
          isLoading={isLoading}
          error={error}
          serverTime={serverTime}
          selectedSite={selectedSite}
          customServerUrl={customServerUrl}
          getHostname={getHostname}
          urgentStyle={urgentStyle}
          showMilliseconds={showMilliseconds}
          t={t}
        />

        <DisplaySettings
          showMilliseconds={showMilliseconds}
          setShowMilliseconds={setShowMilliseconds}
          t={t}
        />
      </section>
    </div>
  );
}
