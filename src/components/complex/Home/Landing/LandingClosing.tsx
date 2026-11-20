import React from 'react';
import { LandingCopy } from '@libs/server/landingCopy';
import { cn } from '@utils/cn';
import { Language } from '~/app/i18n/settings';
import LandingClosingActions from './LandingClosingActions';
import SectionViewTracker from './SectionViewTracker';
import { LANDING_BODY, LANDING_CONTAINER, LANDING_SECTION_TITLE } from './landingStyles';

type LandingClosingProps = {
  lng: Language;
  closing: LandingCopy['closing'];
};

/** 짧은 두 줄 + 액션뿐이라 가운데 정렬을 유지한다(시각 요소가 없는 짧은 블록). */
export default function LandingClosing({ lng, closing }: LandingClosingProps) {
  return (
    <section
      aria-labelledby="landing-closing-title"
      className="border-t border-basic-3 py-24 text-center lg:py-32"
    >
      <SectionViewTracker section="closing" />

      {/* landing-reveal-end: 문서 마지막 섹션은 cover 기반 리빌 종점에 스크롤이 도달할 수
          없어(페이지가 먼저 끝남) entry 기반으로 완주시킨다. 없으면 CTA 버튼이 반투명으로 남는다. */}
      <div className={cn(LANDING_CONTAINER, 'landing-reveal-stagger', 'landing-reveal-end')}>
        <h2
          id="landing-closing-title"
          className={cn(LANDING_SECTION_TITLE, 'mx-auto max-w-[20ch]')}
        >
          <span className="block">{closing.titleLine1}</span>
          <span className="block text-fg-4">{closing.titleLine2}</span>
        </h2>
        <p className={cn(LANDING_BODY, 'mx-auto mt-6 max-w-[46ch]')}>{closing.body}</p>

        <LandingClosingActions
          lng={lng}
          ctaPrimary={closing.ctaPrimary}
          ctaSecondary={closing.ctaSecondary}
        />
      </div>
    </section>
  );
}
