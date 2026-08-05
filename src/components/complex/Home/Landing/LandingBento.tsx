import React from 'react';
import NextLink from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import CursorGlowCard from '@components/complex/Service/CursorGlowCard';
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
  LANDING_CONTAINER,
  LANDING_EYEBROW,
  LANDING_GLASS_CARD,
  LANDING_SECTION_TITLE,
  LANDING_TOOL_PILL,
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

/** 서버 컴포넌트. 리빌은 CSS 스크롤 구동 애니메이션(.landing-reveal-stagger)이 담당한다. */
export default function LandingBento({ lng, bento, toolCountLabel }: LandingBentoProps) {
  return (
    <section aria-labelledby="landing-bento-title" className="relative py-20 lg:py-28">
      <SectionViewTracker section="bento" />

      <div className={LANDING_CONTAINER}>
        <header className="landing-reveal max-w-3xl">
          <p className={LANDING_EYEBROW}>{bento.eyebrow}</p>
          <h2 id="landing-bento-title" className={cn(LANDING_SECTION_TITLE, 'mt-5')}>
            <span className="block">{bento.titleLine1}</span>
            <span className="block">{bento.titleLine2}</span>
          </h2>
          <p className={cn(LANDING_BODY, 'mt-5 max-w-[52ch]')}>{bento.lead}</p>
        </header>

        <div className="landing-reveal-stagger mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {SERVICE_SECTION_ORDER.map((section: ServiceSectionKey) => {
            const span = CATEGORY_BENTO_SPAN[section];
            const isWide = span >= 4;

            return (
              <CursorGlowCard
                key={section}
                className={cn('rounded-[24px]', SPAN_CLASS[span], span === 6 && 'sm:col-span-2')}
              >
                <article
                  className={cn(
                    LANDING_GLASS_CARD,
                    'flex h-full flex-col p-6 transition-transform duration-300 hover:-translate-y-1',
                    isWide && 'lg:p-8',
                  )}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3
                      className={cn(
                        'font-bold tracking-[-0.02em] text-fg-1',
                        isWide ? 'text-xl lg:text-2xl' : 'text-lg',
                      )}
                    >
                      {getServiceSectionLabel(lng, section)}
                    </h3>
                    <span className="shrink-0 text-xs font-semibold text-fg-5">
                      {toolCountLabel(SERVICE_TOOL_COUNT_BY_SECTION[section])}
                    </span>
                  </div>

                  <ul className="mt-5 flex flex-wrap gap-2">
                    {CATEGORY_FEATURED_LINKS[section].map((link) => {
                      const item = getServiceMenuItem(link);
                      if (!item) return null;

                      return (
                        <li key={link}>
                          <LandingToolLink
                            lng={lng}
                            href={link}
                            section={`bento_${section}`}
                            className={LANDING_TOOL_PILL}
                          >
                            <span className="[&>svg]:h-3.5 [&>svg]:w-3.5" aria-hidden>
                              {item.icon}
                            </span>
                            {item.title[lng]}
                          </LandingToolLink>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              </CursorGlowCard>
            );
          })}
        </div>

        <div className="landing-reveal mt-10">
          <NextLink
            href={`/${lng}/menu`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-point-fg transition-colors hover:text-point-2"
          >
            {bento.viewAll}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </NextLink>
        </div>
      </div>
    </section>
  );
}
