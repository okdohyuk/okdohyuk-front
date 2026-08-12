import React from 'react';
import { LandingCopy } from '@libs/server/landingCopy';
import { cn } from '@utils/cn';
import { Language } from '~/app/i18n/settings';
import LandingClosingActions from './LandingClosingActions';
import SectionViewTracker from './SectionViewTracker';
import { LANDING_BODY, LANDING_CONTAINER, LANDING_EYEBROW } from './landingStyles';

type LandingClosingProps = {
  lng: Language;
  closing: LandingCopy['closing'];
};

export default function LandingClosing({ lng, closing }: LandingClosingProps) {
  return (
    <section
      aria-labelledby="landing-closing-title"
      className="relative isolate overflow-hidden py-24 text-center lg:py-36"
    >
      <SectionViewTracker section="closing" />
      <div aria-hidden className="landing-wash-bottom pointer-events-none absolute inset-0 -z-10" />

      {/* landing-reveal-end: 문서 마지막 섹션은 cover 기반 리빌 종점에 스크롤이 도달할 수
          없어(페이지가 먼저 끝남) entry 기반으로 완주시킨다. 없으면 CTA 버튼이 블러 상태로 남는다. */}
      <div className={cn(LANDING_CONTAINER, 'landing-reveal-stagger', 'landing-reveal-end')}>
        <p className={cn(LANDING_EYEBROW, 'block')}>{closing.eyebrow}</p>
        <h2
          id="landing-closing-title"
          className="mx-auto mt-6 max-w-[20ch] text-[clamp(2.3rem,6vw,4.25rem)] font-extrabold leading-[1.02] tracking-[-0.05em] text-fg-1 [word-break:keep-all]"
        >
          <span className="block">{closing.titleLine1}</span>
          <span className="block bg-gradient-to-r from-point-2 via-point-3 to-info-2 bg-clip-text text-transparent">
            {closing.titleLine2}
          </span>
        </h2>
        <p className={cn(LANDING_BODY, 'mx-auto mt-7 max-w-[46ch]')}>{closing.body}</p>

        <LandingClosingActions
          lng={lng}
          ctaPrimary={closing.ctaPrimary}
          ctaSecondary={closing.ctaSecondary}
        />
      </div>
    </section>
  );
}
