'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from '@components/basic/Link';
import { Button } from '@components/basic/Button/Button';
import { setConsentUpdate, sendGAEvent } from '@libs/client/gtag';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

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
  const params = useParams<{ lng?: string }>();
  const language = (params?.lng ?? 'ko') as Language;
  const { t } = useTranslation(language, 'consent');

  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const stored = readStoredConsent();
    if (stored?.granted === true) {
      setConsentUpdate(true);
      setVisible(false);
      return;
    }
    if (stored?.granted === false) {
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

  // Small corner card (desktop bottom-left) / compact bar above the mobile nav — never
  // covers the centre of the first screen.
  return (
    <div
      role="dialog"
      aria-label={t('ariaLabel')}
      aria-describedby="consent-banner-desc"
      aria-live="polite"
      className={cn(
        // Below lg the nav is a floating bottom bar: sit above it and the language select.
        'fixed inset-x-2 bottom-[var(--mobile-floating-clearance)] z-40',
        'lg:inset-x-auto lg:bottom-6 lg:left-6 lg:w-full lg:max-w-sm',
        'rounded-xl border border-basic-3 bg-basic-0 p-3 shadow-md dark:bg-basic-1',
      )}
    >
      <p id="consent-banner-desc" className="text-xs leading-5 text-fg-3">
        {t('description')}{' '}
        <Link
          href="./privacy"
          className="text-fg-1 underline underline-offset-2 transition-colors hover:text-point-fg"
        >
          {t('privacyLink')}
        </Link>
        {t('descriptionSuffix')}
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDeny}
          aria-label={t('denyAriaLabel')}
        >
          {t('deny')}
        </Button>
        <Button type="button" size="sm" onClick={handleAccept} aria-label={t('acceptAriaLabel')}>
          {t('accept')}
        </Button>
      </div>
    </div>
  );
}
