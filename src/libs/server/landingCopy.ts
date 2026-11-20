import { SERVICE_SECTION_ORDER } from '@assets/datas/serviceCategories';
import { SERVICE_TOOL_COUNT } from '@assets/datas/landingShowcase';
import { useTranslation as getServerTranslation } from '~/app/i18n';
import { Language } from '~/app/i18n/settings';

/**
 * 랜딩 페이지 문구를 서버에서 한 번에 해석해 평범한 문자열 객체로 내려준다.
 * 클라이언트 경계(스크롤 스토리·프리뷰)에는 i18next 인스턴스 대신 이 객체만 전달되므로
 * 클라이언트 번들에 locale 리소스가 실리지 않는다.
 *
 * 도구 수·카테고리 수는 문구에 박지 않고 메뉴 데이터에서 세어 `{{count}}` / `{{categories}}`
 * 로 끼워 넣는다. 예전엔 "48+", "50+", "56개"가 곳곳에 따로 적혀 서로 어긋났다.
 */

export type LandingChapterCopy = {
  /** 챕터 번호 + 짧은 주제 (모노·뮤트로 렌더) */
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  body: string;
  /** 실사용 촬영 프레임 시퀀스(포스터 img)의 대체 텍스트 */
  sequenceAlt: string;
};

export type LandingCopy = {
  hero: {
    titleLine1: string;
    titleLine2: string;
    statement: string;
    /** 지원 언어 이름 나열 — 지표 줄의 "지원 언어" 값으로 쓴다 */
    capabilities: string;
    ctaPrimary: string;
    ctaSecondary: string;
    ctaSearch: string;
  };
  stats: {
    toolsLabel: string;
    categoriesLabel: string;
    languagesLabel: string;
    loginLabel: string;
    loginValue: string;
  };
  story: {
    cta: string;
    related: string;
    pokemon: LandingChapterCopy;
    clock: LandingChapterCopy;
    live: LandingChapterCopy;
  };
  bento: {
    titleLine1: string;
    titleLine2: string;
    lead: string;
    viewAll: string;
  };
  blend: {
    title: string;
    body: string;
    cta: string;
  };
  closing: {
    titleLine1: string;
    titleLine2: string;
    body: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  /** 카테고리 카드의 "N개 도구" 문구를 만들기 위한 포매터 결과 캐시 */
  toolCountLabel: (count: number) => string;
};

export async function getLandingCopy(language: Language): Promise<LandingCopy> {
  const { t } = await getServerTranslation(language, 'landing');
  const counts = { count: SERVICE_TOOL_COUNT, categories: SERVICE_SECTION_ORDER.length };

  const chapter = (id: 'pokemon' | 'clock' | 'live'): LandingChapterCopy => ({
    eyebrow: t(`story.${id}.eyebrow`),
    titleLine1: t(`story.${id}.titleLine1`),
    titleLine2: t(`story.${id}.titleLine2`),
    body: t(`story.${id}.body`),
    sequenceAlt: t(`story.${id}.sequenceAlt`),
  });

  return {
    hero: {
      titleLine1: t('hero.titleLine1', counts),
      titleLine2: t('hero.titleLine2', counts),
      statement: t('hero.statement'),
      capabilities: t('hero.capabilities'),
      ctaPrimary: t('hero.ctaPrimary'),
      ctaSecondary: t('hero.ctaSecondary'),
      ctaSearch: t('hero.ctaSearch'),
    },
    stats: {
      toolsLabel: t('stats.toolsLabel'),
      categoriesLabel: t('stats.categoriesLabel'),
      languagesLabel: t('stats.languagesLabel'),
      loginLabel: t('stats.loginLabel'),
      loginValue: t('stats.loginValue'),
    },
    story: {
      cta: t('story.cta'),
      related: t('story.related'),
      pokemon: chapter('pokemon'),
      clock: chapter('clock'),
      live: chapter('live'),
    },
    bento: {
      titleLine1: t('bento.titleLine1', counts),
      titleLine2: t('bento.titleLine2', counts),
      lead: t('bento.lead'),
      viewAll: t('bento.viewAll'),
    },
    blend: {
      title: t('blend.title', counts),
      body: t('blend.body', counts),
      cta: t('blend.cta'),
    },
    closing: {
      titleLine1: t('closing.titleLine1'),
      titleLine2: t('closing.titleLine2'),
      body: t('closing.body'),
      ctaPrimary: t('closing.ctaPrimary'),
      ctaSecondary: t('closing.ctaSecondary'),
    },
    toolCountLabel: (count: number) => t('bento.toolCount', { count }),
  };
}
