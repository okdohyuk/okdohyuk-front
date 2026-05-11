'use client';

import React, { useEffect, useState } from 'react';
import { jwtDecode, JwtHeader, JwtPayload } from 'jwt-decode';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { useToolTracking } from '@hooks/analytics/useToolTracking';
import GoogleAd from '@components/google/GoogleAd';
import JwtTokenInput from './JwtTokenInput';
import JwtDecodedPanel from './JwtDecodedPanel';

type DecodedPart = JwtHeader | JwtPayload | Record<string, unknown>;

type DecodedToken = {
  header: DecodedPart;
  payload: DecodedPart;
};

type JwtDecoderClientProps = {
  lng: Language;
};

function JwtDecoderClient({ lng }: JwtDecoderClientProps) {
  const { t } = useTranslation(lng, 'jwt-decoder');
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<DecodedToken | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { trackInputStarted, trackUse } = useToolTracking('jwt-decoder', 'utility');

  useEffect(() => {
    const trimmedToken = token.trim();
    if (!trimmedToken) {
      setDecoded(null);
      setError(null);
      return;
    }

    try {
      const parts = trimmedToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid structure');
      }

      const header = jwtDecode<JwtHeader>(trimmedToken, { header: true });
      const payload = jwtDecode<JwtPayload>(trimmedToken);
      setDecoded({ header, payload });
      setError(null);
      // PII 안전: 디코딩 성공 여부만 전송, payload 내용 절대 포함 금지
      trackUse({ action_type: 'decode', success: true });
    } catch (err) {
      setDecoded(null);
      setError(t('error.invalidFormat'));
      // PII 안전: 토큰 본문 미포함, 실패 카테고리만 전송
      trackUse({ action_type: 'decode', success: false, error_code: 'invalid_format' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, t]);

  const handleTokenChange = (next: string) => {
    if (next.length > 0) {
      trackInputStarted();
    }
    setToken(next);
  };

  return (
    <div className={cn(SERVICE_PANEL_SOFT, 'w-full space-y-6 p-4')}>
      <JwtTokenInput
        label={t('label.encodedToken')}
        placeholder={t('placeholder')}
        token={token}
        error={error}
        onChange={handleTokenChange}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <JwtDecodedPanel
          title={t('label.header')}
          value={decoded?.header ?? null}
          emptyText="// Header"
        />
        <JwtDecodedPanel
          title={t('label.payload')}
          value={decoded?.payload ?? null}
          emptyText="// Payload"
        />
      </div>
      {decoded && <GoogleAd slotId="7911066601" className="w-full mt-4" />}
    </div>
  );
}

export default JwtDecoderClient;
