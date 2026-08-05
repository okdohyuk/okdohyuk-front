/* eslint-disable react/require-default-props */

'use client';

import React from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';
import { sendGAEvent } from '@libs/client/gtag';
import { openCommandPalette } from '@utils/commandPalette';
import { rememberLoginRedirect } from '@utils/loginRedirect';
import { cn } from '@utils/cn';
import { Language } from '~/app/i18n/settings';
import { LANDING_CTA_PRIMARY, LANDING_CTA_SECONDARY } from './landingStyles';

type LandingHeroActionsProps = {
  lng: Language;
  ctaPrimary: string;
  ctaSecondary: string;
  ctaSearch: string;
  className?: string;
};

export default function LandingHeroActions({
  lng,
  ctaPrimary,
  ctaSecondary,
  ctaSearch,
  className,
}: LandingHeroActionsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogin = () => {
    sendGAEvent('hero_cta_click', 'login');
    rememberLoginRedirect(pathname);
    router.push(`/${lng}/auth/login`);
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <NextLink
        href={`/${lng}/menu`}
        className={LANDING_CTA_PRIMARY}
        onClick={() => sendGAEvent('hero_cta_click', 'explore_tools')}
      >
        {ctaPrimary}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </NextLink>

      <button type="button" className={LANDING_CTA_SECONDARY} onClick={handleLogin}>
        {ctaSecondary}
      </button>

      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full px-3 py-3 text-sm font-semibold text-fg-4 transition-colors hover:text-point-fg"
        onClick={() => {
          sendGAEvent('hero_cta_click', 'quick_search');
          openCommandPalette();
        }}
      >
        <Search className="h-4 w-4" aria-hidden />
        {ctaSearch}
        <kbd className="rounded-md border border-basic-3 bg-basic-1 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-fg-5">
          ⌘K
        </kbd>
      </button>
    </div>
  );
}
