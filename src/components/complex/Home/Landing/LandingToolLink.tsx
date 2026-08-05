/* eslint-disable react/require-default-props */

'use client';

import React from 'react';
import NextLink from 'next/link';
import { sendGAEvent } from '@libs/client/gtag';
import { Language } from '~/app/i18n/settings';

type LandingToolLinkProps = {
  lng: Language;
  /** `/pokemon-type-calculator` 처럼 locale 이 붙지 않은 서비스 경로 */
  href: string;
  /** GA 이벤트에 남길 랜딩 섹션 식별자 */
  section: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * 랜딩에서 도구로 이동하는 링크. 클릭 시 `tool_open` 이벤트를 발화한다.
 * 아이콘·라벨은 서버에서 렌더된 children 으로 받아 클라이언트 번들을 최소화한다.
 */
export default function LandingToolLink({
  lng,
  href,
  section,
  className,
  children,
}: LandingToolLinkProps) {
  return (
    <NextLink
      href={`/${lng}${href}`}
      className={className}
      onClick={() =>
        sendGAEvent('tool_open', href, { from_section: section, entry_point: 'landing' })
      }
    >
      {children}
    </NextLink>
  );
}
