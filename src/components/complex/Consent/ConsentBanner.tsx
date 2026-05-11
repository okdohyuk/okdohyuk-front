'use client';

import * as React from 'react';
import Link from '@components/basic/Link';
import { Button } from '@components/basic/Button/Button';
import { setConsentUpdate, sendGAEvent } from '@libs/client/gtag';

const STORAGE_KEY = 'consent_v1';
// 13개월(395일) — GA4 동의 보관 가이드 기준
const CONSENT_TTL_MS = 395 * 24 * 60 * 60 * 1000;

type StoredConsent = {
  granted: boolean;
  granted_at: number;
};

function readStoredConsent(): StoredConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (typeof parsed?.granted !== 'boolean' || typeof parsed?.granted_at !== 'number') {
      return null;
    }
    // TTL 만료 체크
    if (Date.now() - parsed.granted_at > CONSENT_TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredConsent(granted: boolean) {
  if (typeof window === 'undefined') return;
  try {
    const payload: StoredConsent = { granted, granted_at: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage 사용 불가 환경 — 무시
  }
}

export default function ConsentBanner() {
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const stored = readStoredConsent();
    if (stored?.granted === true) {
      // 기존 동의 복원
      setConsentUpdate(true);
      setVisible(false);
      return;
    }
    if (stored?.granted === false) {
      // 거부 상태도 보관 — 배너 미노출
      setVisible(false);
      return;
    }
    setVisible(true);
  }, []);

  const handleAccept = React.useCallback(() => {
    writeStoredConsent(true);
    setConsentUpdate(true);
    sendGAEvent('consent_update', 'granted', { analytics: 'granted', ad: 'denied' });
    setVisible(false);
  }, []);

  const handleDeny = React.useCallback(() => {
    writeStoredConsent(false);
    setConsentUpdate(false);
    sendGAEvent('consent_update', 'denied', { analytics: 'denied', ad: 'denied' });
    setVisible(false);
  }, []);

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-label="쿠키 사용 동의"
      aria-describedby="consent-banner-desc"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 sm:pb-6"
    >
      <div className="w-full max-w-lg rounded-2xl border border-basic-3 bg-basic-0 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)] sm:p-5">
        <p id="consent-banner-desc" className="text-sm leading-relaxed text-fg-1 sm:text-base">
          이 사이트는 사용자 경험 개선과 서비스 분석을 위해 쿠키를 사용합니다. 자세한 내용은{' '}
          <Link href="./privacy" className="underline underline-offset-2 hover:text-point-1">
            개인정보처리방침
          </Link>
          에서 확인하세요.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            onClick={handleDeny}
            className="bg-basic-2 text-fg-1 hover:bg-basic-3"
            aria-label="쿠키 사용 거부"
          >
            거부
          </Button>
          <Button type="button" onClick={handleAccept} aria-label="쿠키 사용 동의">
            동의
          </Button>
        </div>
      </div>
    </div>
  );
}
