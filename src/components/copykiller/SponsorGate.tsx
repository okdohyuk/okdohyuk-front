'use client';

import React from 'react';
import { Lock, Heart, LogIn } from 'lucide-react';
import { cn } from '@utils/cn';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { UserRoleEnum } from '@api/User';

export interface SponsorGateProps {
  /** null = 비로그인 */
  userRole: UserRoleEnum | null;
  children: React.ReactNode;
  /** i18n — 로그인 유도 제목 */
  loginTitle: string;
  /** i18n — 로그인 유도 설명 */
  loginDescription: string;
  /** i18n — 로그인 버튼 텍스트 */
  loginCta: string;
  /** i18n — 후원자 전용 제목 */
  sponsorTitle: string;
  /** i18n — 후원자 전용 설명 */
  sponsorDescription: string;
  /** i18n — 후원 페이지 링크 텍스트 */
  sponsorCta: string;
  /** 로그인 페이지 경로 */
  loginHref: string;
  /** 후원 페이지 경로 */
  sponsorHref: string;
}

/**
 * SponsorGate — 접근 권한에 따라 세 가지 상태를 렌더링한다.
 *
 * - userRole === null | undefined  → 비로그인 안내 + 로그인 CTA
 * - userRole === 'USER' | 'BAN_USER' → 후원자 전용 안내 + 후원 링크
 * - userRole === 'SPONSOR' | 'ADMIN' → children 렌더링
 */
function SponsorGate({
  userRole,
  children,
  loginTitle,
  loginDescription,
  loginCta,
  sponsorTitle,
  sponsorDescription,
  sponsorCta,
  loginHref,
  sponsorHref,
}: SponsorGateProps) {
  const isAuthorized = userRole === UserRoleEnum.Sponsor || userRole === UserRoleEnum.Admin;
  const isGuest = !userRole;

  if (isAuthorized) {
    return children as React.ReactElement;
  }

  return (
    <section
      className={cn(SERVICE_PANEL_SOFT, 'flex flex-col items-center gap-5 px-6 py-10 text-center')}
      aria-label={isGuest ? loginTitle : sponsorTitle}
    >
      {/* 아이콘 */}
      <div
        className={cn(
          'flex h-16 w-16 items-center justify-center rounded-2xl',
          isGuest
            ? 'bg-info-4/60 text-info-2 dark:bg-info-3/20'
            : 'bg-warn-4/60 text-warn-2 dark:bg-warn-3/20',
        )}
        aria-hidden="true"
      >
        {isGuest ? <LogIn className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
      </div>

      {/* 제목 + 설명 */}
      <div className="max-w-xs space-y-2">
        <p className="text-base font-bold text-fg-1">{isGuest ? loginTitle : sponsorTitle}</p>
        <p className="text-sm leading-relaxed text-fg-4">
          {isGuest ? loginDescription : sponsorDescription}
        </p>
      </div>

      {/* CTA */}
      {isGuest ? (
        <Button asChild analyticsKey="copykiller_gate_login" className="min-w-[160px] gap-2">
          <a href={loginHref}>
            <LogIn className="h-4 w-4" aria-hidden="true" />
            {loginCta}
          </a>
        </Button>
      ) : (
        <Button asChild analyticsKey="copykiller_gate_sponsor" className="min-w-[160px] gap-2">
          <a href={sponsorHref} target="_blank" rel="noopener noreferrer">
            <Heart className="h-4 w-4" aria-hidden="true" />
            {sponsorCta}
          </a>
        </Button>
      )}
    </section>
  );
}

export default SponsorGate;
