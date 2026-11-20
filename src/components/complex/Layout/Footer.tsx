/* eslint-disable react/require-default-props */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';

interface FooterProps {
  lng: Language;
  className?: string;
}

const blockedPaths = ['/multi-live', '/admin', '/ppt/present', '/ppt/remote'];

function Footer({ lng, className = '' }: FooterProps) {
  const { t } = useTranslation(lng, 'common');
  const pathname = usePathname();

  if (blockedPaths.some((path) => pathname.includes(path))) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const linkClassName = 'rounded-sm transition-colors hover:text-fg-1 focus-ring';
  const separatorClassName = 'mx-2 text-fg-6';

  return (
    <footer
      className={cn(
        'w-full border-t border-basic-3 bg-basic-0 py-6',
        // Reserve room for the floating mobile nav and the home indicator.
        'mb-[var(--mobile-nav-clearance)] lg:mb-0',
        className,
      )}
    >
      <div className="container mx-auto px-4">
        <div className="text-center text-xs text-fg-5">
          <p className="flex flex-wrap items-center justify-center tabular-nums">
            <span>
              © {currentYear} {t('footer.appName')}
            </span>
            <span className={separatorClassName}>|</span>
            <Link href="/terms" className={linkClassName}>
              {t('footer.terms')}
            </Link>
            <span className={separatorClassName}>·</span>
            <Link href="/privacy" className={linkClassName}>
              {t('footer.privacy')}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
