'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { sendGAEvent } from '@libs/client/gtag';

const STALE_RELOAD_KEY = 'sentry_stale_action_reloaded';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isStaleDeployment = error.message?.includes('Failed to find Server Action');

  useEffect(() => {
    if (isStaleDeployment) {
      const alreadyReloaded = sessionStorage.getItem(STALE_RELOAD_KEY);
      if (!alreadyReloaded) {
        sessionStorage.setItem(STALE_RELOAD_KEY, '1');
        window.location.reload();
      }
      return;
    }
    Sentry.captureException(error);
    sendGAEvent('exception', error.message?.slice(0, 200) ?? 'unknown', { fatal: true });
  }, [error, isStaleDeployment]);

  if (isStaleDeployment) {
    return (
      <html lang="en">
        <body
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p>페이지를 업데이트하는 중입니다...</p>
            <button type="button" onClick={() => window.location.reload()}>
              새로고침
            </button>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p>오류가 발생했습니다.</p>
          <button type="button" onClick={reset}>
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
