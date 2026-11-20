'use client';

import React from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { sendGAEvent } from '@libs/client/gtag';
import { rememberLoginRedirect } from '@utils/loginRedirect';
import { Language } from '~/app/i18n/settings';

type LandingClosingActionsProps = {
  lng: Language;
  ctaPrimary: string;
  ctaSecondary: string;
};

export default function LandingClosingActions({
  lng,
  ctaPrimary,
  ctaSecondary,
}: LandingClosingActionsProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
      <Button asChild size="lg">
        <NextLink
          href={`/${lng}/menu`}
          onClick={() => sendGAEvent('hero_cta_click', 'closing_explore_tools')}
        >
          {ctaPrimary}
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </NextLink>
      </Button>

      <Button
        variant="secondary"
        size="lg"
        onClick={() => {
          sendGAEvent('hero_cta_click', 'closing_login');
          rememberLoginRedirect(pathname);
          router.push(`/${lng}/auth/login`);
        }}
      >
        {ctaSecondary}
      </Button>
    </div>
  );
}
