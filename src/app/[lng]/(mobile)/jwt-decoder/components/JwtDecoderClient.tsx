'use client';

import React, { useEffect, useState } from 'react';
import { jwtDecode, JwtHeader, JwtPayload } from 'jwt-decode';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
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
    } catch (err) {
      setDecoded(null);
      setError(t('error.invalidFormat'));
    }
  }, [token, t]);

  return (
    <div className={cn(SERVICE_PANEL_SOFT, 'w-full space-y-6 p-4')}>
      <JwtTokenInput
        label={t('label.encodedToken')}
        placeholder={t('placeholder')}
        token={token}
        error={error}
        onChange={setToken}
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
    </div>
  );
}

export default JwtDecoderClient;
