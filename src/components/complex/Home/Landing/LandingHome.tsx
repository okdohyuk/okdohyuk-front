import React from 'react';
import {
  SHOWCASE_CHAPTER_IDS,
  SHOWCASE_CHAPTER_LINKS,
  getServiceMenuItem,
} from '@assets/datas/landingShowcase';
import { LandingCopy } from '@libs/server/landingCopy';
import { Language } from '~/app/i18n/settings';
import LandingSceneStage from './LandingSceneStage';
import LandingScrollReveal from './LandingScrollReveal';
import LandingHeroActions from './LandingHeroActions';
import LandingHeroStats from './LandingHeroStats';
import LandingBento from './LandingBento';
import LandingClosing from './LandingClosing';
import { LANDING_REVEAL_BOOTSTRAP } from './landingRevealBootstrap';
import type { StoryChapterData, StoryToolLink } from './landingStoryTypes';

type LandingHomeProps = {
  lng: Language;
  copy: LandingCopy;
};

const toToolLink = (lng: Language, href: string): StoryToolLink | null => {
  const item = getServiceMenuItem(href);
  if (!item) return null;
  return { href, label: item.title[lng] };
};

/**
 * 비로그인 사용자용 서비스 소개 랜딩 — 애플 제품 페이지식 풀스크린 sticky 씬 연속.
 *
 * 씬 흐름: 히어로 텍스트 연출 → 도구 시퀀스 ×3 → 블렌딩(전체 도구 목록) → 일반 스크롤(벤토·클로징).
 * 카피/링크는 전부 서버에서 해석해 평문으로 넘기므로 locale 리소스가 클라이언트 번들에 실리지 않는다.
 */
export default function LandingHome({ lng, copy }: LandingHomeProps) {
  const chapters: StoryChapterData[] = SHOWCASE_CHAPTER_IDS.map((id) => {
    const [primaryLink, ...relatedLinks] = SHOWCASE_CHAPTER_LINKS[id];
    const primary = toToolLink(lng, primaryLink);

    return {
      id,
      copy: copy.story[id],
      primary: primary ?? { href: primaryLink, label: copy.story.cta },
      related: relatedLinks
        .map((link) => toToolLink(lng, link))
        .filter((tool): tool is StoryToolLink => tool !== null),
    };
  });

  return (
    <main className="relative w-full overflow-x-clip">
      {/*
        첫 페인트 전에 스크롤 구동 애니메이션 지원 여부를 판정한다.
        미지원 브라우저에만 <html class="no-sda"> 를 붙여 IntersectionObserver 폴백으로 넘긴다.
      */}
      {/* eslint-disable-next-line react/no-danger */}
      <script dangerouslySetInnerHTML={{ __html: LANDING_REVEAL_BOOTSTRAP }} />
      <LandingScrollReveal />

      <LandingSceneStage
        lng={lng}
        hero={copy.hero}
        story={copy.story}
        chapters={chapters}
        blendCaption={copy.blend}
        heroActions={
          <LandingHeroActions
            lng={lng}
            ctaPrimary={copy.hero.ctaPrimary}
            ctaSecondary={copy.hero.ctaSecondary}
            ctaSearch={copy.hero.ctaSearch}
            className="justify-center"
          />
        }
        heroStats={<LandingHeroStats stats={copy.stats} />}
      >
        <LandingBento lng={lng} bento={copy.bento} toolCountLabel={copy.toolCountLabel} />
        <LandingClosing lng={lng} closing={copy.closing} />
      </LandingSceneStage>
    </main>
  );
}
