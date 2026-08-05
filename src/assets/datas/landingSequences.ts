import { ShowcaseChapterId } from './landingShowcase';

/**
 * 랜딩 스토리 챕터별 실사용 촬영 프레임 시퀀스.
 *
 * 프레임은 Playwright 로 실제 도구를 조작하며 찍는다 — `scripts/captureLandingFrames.js`.
 * 이 파일의 `frameCount` 는 그 스크립트의 촬영 결과와 반드시 일치해야 한다
 * (초과 지정 시 404, 미달 지정 시 시퀀스가 중간에서 끝난다).
 * 재촬영 후에는 `node scripts/captureLandingFrames.js` 가 출력하는 프레임 수로 갱신할 것.
 */
export type LandingSequenceSpec = {
  /** `{frame}` 자리에 1-based 3자리 인덱스가 들어간다. */
  framePath: string;
  frameCount: number;
  poster: string;
};

export const SHOWCASE_SEQUENCE_FRAME_COUNT = 90;

export const SHOWCASE_SEQUENCES: Record<ShowcaseChapterId, LandingSequenceSpec> = {
  pokemon: {
    framePath: '/landing/seq/pokemon/frame-{frame}.webp',
    frameCount: SHOWCASE_SEQUENCE_FRAME_COUNT,
    poster: '/landing/seq/pokemon/poster.webp',
  },
  clock: {
    framePath: '/landing/seq/clock/frame-{frame}.webp',
    frameCount: SHOWCASE_SEQUENCE_FRAME_COUNT,
    poster: '/landing/seq/clock/poster.webp',
  },
  live: {
    framePath: '/landing/seq/live/frame-{frame}.webp',
    frameCount: SHOWCASE_SEQUENCE_FRAME_COUNT,
    poster: '/landing/seq/live/poster.webp',
  },
};
