/* eslint-disable react/require-default-props */

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Keycap } from '@components/basic/Keycap';
import { openCommandPalette } from '@utils/commandPalette';
import useShortcutLabel from '@hooks/useShortcutLabel';
import { stringToLanguage } from '@utils/localeUtil';
import { cn } from '@utils/cn';
import { fallbackLng } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';

/** Home-directory shorthand keeps the label short; the full host is already in the address bar. */
const PATH_PREFIX = '~';

/** usePathname() returns the encoded path; show `/ko/blog/리액트` rather than `%EB%A6%AC…`. */
function decodePathname(pathname: string): string {
  try {
    return decodeURI(pathname);
  } catch {
    // Malformed escape sequences: fall back to the raw path instead of crashing the header.
    return pathname;
  }
}

/** The locale is already chosen in the language switcher, so the label shows `~/percent`, not `~/ko/percent`. */
function stripLocaleSegment(pathname: string): string {
  const [, firstSegment = '', ...rest] = pathname.split('/');
  if (stringToLanguage(firstSegment) === null) return pathname;
  return `/${rest.join('/')}`;
}

type ServicePageMetaProps = {
  /** Category label shown after the path, as quiet sentence-case text. */
  badge?: string;
  className?: string;
};

/*
 * Signature row for every tool header: `~/{slug}` in muted mono, an optional
 * category, and the ⌘K keycap that opens the existing command palette (desktop only).
 */
function ServicePageMeta({ badge, className = '' }: ServicePageMetaProps) {
  const pathname = usePathname();
  const localeSegment = pathname?.split('/')[1] ?? fallbackLng;
  const language = stringToLanguage(localeSegment) ?? fallbackLng;
  const { t } = useTranslation(language, 'common');
  const shortcut = useShortcutLabel();

  const path = pathname
    ? `${PATH_PREFIX}${stripLocaleSegment(decodePathname(pathname)).replace(/\/$/, '')}`
    : null;

  if (!path && !badge) return null;

  return (
    <div className={cn('flex min-w-0 items-center gap-2 text-xs leading-4 text-fg-5', className)}>
      {path ? (
        <span translate="no" className="min-w-0 truncate font-mono tabular-nums">
          {path}
        </span>
      ) : null}
      {path && badge ? (
        <span aria-hidden className="shrink-0 text-fg-6">
          ·
        </span>
      ) : null}
      {badge ? <span className="shrink-0">{badge}</span> : null}
      <button
        type="button"
        onClick={openCommandPalette}
        aria-label={t('navigation.openSearch')}
        className="ml-auto hidden shrink-0 rounded-sm p-0.5 transition-colors hover:bg-basic-2 focus-ring md:inline-flex"
      >
        <Keycap>{shortcut}</Keycap>
      </button>
    </div>
  );
}

export default ServicePageMeta;
