'use client';

import React, { useState } from 'react';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
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
  const [selectedSite, setSelectedSite] = useState(TICKETING_SITES[0]);
  const [customServerUrl, setCustomServerUrl] = useState<string>('');
  const [inputCustomUrl, setInputCustomUrl] = useState<string>('');
  const [showMilliseconds, setShowMilliseconds] = useState(true);

  const { serverTime, isLoading, error, setTimeOffset, setServerTime, setError, setIsLoading } =
    useServerTime(lng, selectedSite, customServerUrl);
  const urgentStyle = useUrgentStyle(serverTime);

  const handleSiteSelection = (site: string) => {
    if (selectedSite === site && site !== 'custom') return;

    setIsLoading(true);
    setError(null);
    setServerTime(null);
    setTimeOffset(0);

    setSelectedSite(site);

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
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-220px)] w-full max-w-4xl flex-col justify-center gap-4 text-center">
      <ServicePageHeader
        title={t('title')}
        description={t('availableSites')}
        badge="Real-time Sync"
      />

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
            setInputCustomUrl={setInputCustomUrl}
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
