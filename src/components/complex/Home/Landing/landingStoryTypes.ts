import type { LandingChapterCopy } from '@libs/server/landingCopy';
import type { ShowcaseChapterId } from '@assets/datas/landingShowcase';

/** 도구 씬에서 함께 보여주는 링크 한 줄 */
export type StoryToolLink = { href: string; label: string };

/**
 * 도구 씬 하나에 필요한 서버 해석 완료 데이터.
 * 카피/라벨을 서버에서 평문으로 만들어 넘기므로 locale 리소스가 클라이언트 번들에 실리지 않는다.
 */
export type StoryChapterData = {
  id: ShowcaseChapterId;
  copy: LandingChapterCopy;
  primary: StoryToolLink;
  related: StoryToolLink[];
};
