/* eslint-disable react/require-default-props */

'use client';

import React from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Keycap } from '@components/basic/Keycap';
import useShortcutLabel from '@hooks/useShortcutLabel';
import { sendGAEvent } from '@libs/client/gtag';
import { openCommandPalette } from '@utils/commandPalette';
import { rememberLoginRedirect } from '@utils/loginRedirect';
import { cn } from '@utils/cn';
import { Language } from '~/app/i18n/settings';

/** 390px 폭에서 세 액션이 한 줄에 들어가도록 모바일에서만 버튼을 md 크기로 낮춘다. */
const MOBILE_COMPACT = 'min-h-10 px-4 text-sm sm:min-h-11 sm:px-5 sm:text-base';

type LandingHeroActionsProps = {
  lng: Language;
  ctaPrimary: string;
  /** 로그인 — 버튼이 아니라 조용한 텍스트 링크로 둔다 */
  ctaSecondary: string;
  ctaSearch: string;
  className?: string;
};

/**
 * 히어로 액션: 주 버튼(도구 탐색) 1개 + 보조 버튼(빠른 검색, ⌘K) 1개.
 * 로그인은 세 번째 버튼이 되지 않도록 같은 줄의 뮤트 텍스트 링크로 낮춘다.
 */
export default function LandingHeroActions({
  lng,
  ctaPrimary,
  ctaSecondary,
  ctaSearch,
  className,
}: LandingHeroActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const shortcutLabel = useShortcutLabel();

  const handleLogin = () => {
    sendGAEvent('hero_cta_click', 'login');
    rememberLoginRedirect(pathname);
    router.push(`/${lng}/auth/login`);
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <Button asChild size="lg" className={MOBILE_COMPACT}>
        <NextLink
          href={`/${lng}/menu`}
          onClick={() => sendGAEvent('hero_cta_click', 'explore_tools')}
        >
          {ctaPrimary}
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </NextLink>
      </Button>

      <Button
        variant="secondary"
        size="lg"
        className={MOBILE_COMPACT}
        onClick={() => {
          sendGAEvent('hero_cta_click', 'quick_search');
          openCommandPalette();
        }}
      >
        <Search className="h-4 w-4 text-fg-5" strokeWidth={1.75} aria-hidden />
        {ctaSearch}
        {/* 터치 기기에는 단축키가 없으므로 데스크톱에서만 키캡을 보인다. */}
        <Keycap className="hidden md:inline-flex">{shortcutLabel}</Keycap>
      </Button>

      <button
        type="button"
        onClick={handleLogin}
        className="rounded-md px-2 py-2 text-sm text-fg-4 underline-offset-4 transition-colors hover:text-fg-1 hover:underline focus-ring"
      >
        {ctaSecondary}
      </button>
    </div>
  );
}
