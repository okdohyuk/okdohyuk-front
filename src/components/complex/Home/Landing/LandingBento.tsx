import React from 'react';
import NextLink from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  SERVICE_SECTION_ORDER,
  ServiceSectionKey,
  getServiceSectionLabel,
} from '@assets/datas/serviceCategories';
import {
  CATEGORY_BENTO_SPAN,
  CATEGORY_FEATURED_LINKS,
  SERVICE_TOOL_COUNT_BY_SECTION,
  getServiceMenuItem,
} from '@assets/datas/landingShowcase';
import { LandingCopy } from '@libs/server/landingCopy';
import { cn } from '@utils/cn';
import { Language } from '~/app/i18n/settings';
import LandingToolLink from './LandingToolLink';
import SectionViewTracker from './SectionViewTracker';
import {
  LANDING_BODY,
  LANDING_CARD,
  LANDING_CONTAINER,
  LANDING_META,
  LANDING_SECTION_TITLE,
  LANDING_TOOL_LINK,
} from './landingStyles';

type LandingBentoProps = {
  lng: Language;
  bento: LandingCopy['bento'];
  toolCountLabel: LandingCopy['toolCountLabel'];
};

const SPAN_CLASS: Record<2 | 3 | 4 | 6, string> = {
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
  6: 'lg:col-span-6',
};

/**
 * 카테고리 그리드. 서버 컴포넌트 — 리빌은 CSS 스크롤 구동 애니메이션(.landing-reveal-stagger).
 * 카드는 단일 레이어(헤어라인 + 표면)이고 호버 리프트·커서 글로우는 없다.
 */
export default function LandingBento({ lng, bento, toolCountLabel }: LandingBentoProps) {
  return (
    <section aria-labelledby="landing-bento-title" className="py-24 lg:py-32">
      <SectionViewTracker section="bento" />

      <div className={LANDING_CONTAINER}>
        <header className="landing-reveal max-w-3xl">
          <h2 id="landing-bento-title" className={LANDING_SECTION_TITLE}>
            <span className="block">{bento.titleLine1}</span>
            <span className="block text-fg-4">{bento.titleLine2}</span>
          </h2>
          <p className={cn(LANDING_BODY, 'mt-4 max-w-[52ch]')}>{bento.lead}</p>
        </header>

        <div className="landing-reveal-stagger mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {SERVICE_SECTION_ORDER.map((section: ServiceSectionKey) => {
            const span = CATEGORY_BENTO_SPAN[section];

            return (
              <article
                key={section}
                className={cn(
                  LANDING_CARD,
                  'flex flex-col p-6',
                  SPAN_CLASS[span],
                  span === 6 && 'sm:col-span-2',
                )}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-lg font-medium leading-6 text-fg-1 [word-break:keep-all]">
                    {getServiceSectionLabel(lng, section)}
                  </h3>
                  <span className={cn(LANDING_META, 'shrink-0')}>
                    {toolCountLabel(SERVICE_TOOL_COUNT_BY_SECTION[section])}
                  </span>
                </div>

                <ul className="mt-4 flex flex-wrap gap-2">
                  {CATEGORY_FEATURED_LINKS[section].map((link) => {
                    const item = getServiceMenuItem(link);
                    if (!item) return null;

                    return (
                      <li key={link}>
                        <LandingToolLink
                          lng={lng}
                          href={link}
                          section={`bento_${section}`}
                          className={LANDING_TOOL_LINK}
                        >
                          <span
                            className="text-fg-5 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:stroke-[1.75]"
                            aria-hidden
                          >
                            {item.icon}
                          </span>
                          {item.title[lng]}
                        </LandingToolLink>
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="landing-reveal mt-8">
          <NextLink
            href={`/${lng}/menu`}
            className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-fg-3 underline-offset-4 transition-colors hover:text-fg-1 hover:underline focus-ring"
          >
            {bento.viewAll}
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </NextLink>
        </div>
      </div>
    </section>
  );
}
