import { PRESENTATION_SCHEMA_VERSION, normalizePresentationTheme } from './types';
import type { PresentationDocument, PresentationLayout, PresentationTheme } from './types';
import { PRESENTATION_TEMPLATES, getPresentationTemplate } from './templates';

export interface HtmlImageSource {
  slideIndex: number;
  src: string;
}

export interface ParseHtmlResult {
  document: PresentationDocument;
  theme: PresentationTheme;
  title: string;
  warnings: string[];
  /** 슬라이드별 원본 img src. http는 imageUrl로도 들어가고, data/상대경로는 import 단계에서 업로드한다. */
  imageSources: HtmlImageSource[];
}

const SUBTITLE_SELECTORS = ['.lede', '.cover-en', '.sub'];

const textOf = (element: Element | null): string =>
  element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';

const stripLabelIndex = (label: string) => label.replace(/^\d{1,2}\s*/, '').trim();

const findTemplateByLabel = (label: string) => {
  const normalized = stripLabelIndex(label);
  if (!normalized) return null;
  const exact = PRESENTATION_TEMPLATES.find(
    (template) =>
      template.name === normalized || template.name.toLowerCase() === normalized.toLowerCase(),
  );
  if (exact) return exact;
  // "53 Timeline 마일스톤" 같이 번역 섞인 라벨은 첫 단어로 매칭한다
  const firstToken = normalized.split(/\s+/)[0]?.toLowerCase();
  if (!firstToken || firstToken.length < 2) return null;
  return (
    PRESENTATION_TEMPLATES.find((template) => template.name.toLowerCase().startsWith(firstToken)) ??
    null
  );
};

const inferLayout = (section: Element): PresentationLayout => {
  if (section.classList.contains('cover')) return 'cover';
  if (section.querySelector('.toc-grid')) return 'agenda';
  if (section.querySelector('table')) return 'table';
  if (section.querySelector('.num-list')) return 'list';
  if (section.querySelector('svg')) return 'chart';
  const listItems = section.querySelectorAll('li');
  if (listItems.length >= 2) return 'list';
  return 'concept';
};

const collectItems = (section: Element): string[] => {
  const items: string[] = [];

  section.querySelectorAll('.toc-item').forEach((item) => {
    const ttl = textOf(item.querySelector('.ttl'));
    const sub = textOf(item.querySelector('.sub'));
    items.push(sub ? `${ttl} — ${sub}` : ttl);
  });

  if (items.length === 0) {
    section.querySelectorAll('ol li, ul li:not(.refs li)').forEach((item) => {
      const strong = item.querySelector('strong');
      const strongText = textOf(strong);
      const fullText = textOf(item).replace(/^[0-9]+[.·]?\s*/, '');
      if (strongText && fullText.startsWith(strongText)) {
        const rest = fullText.slice(strongText.length).replace(/^[\s—-]+/, '');
        items.push(rest ? `${strongText} — ${rest}` : strongText);
      } else {
        items.push(fullText);
      }
    });
  }

  return items.filter((item) => item.length > 0);
};

const parseSlide = (section: Element, index: number, notes: string[]) => {
  const label = section.getAttribute('data-label') ?? '';
  const eyebrow =
    textOf(section.querySelector('.eyebrow')) || textOf(section.querySelector('.cover-kicker'));

  let title = textOf(section.querySelector('h1')) || textOf(section.querySelector('.s-title'));
  if (!title && label) title = stripLabelIndex(label);

  let subtitle = '';
  const subtitleSource = SUBTITLE_SELECTORS.map((selector) =>
    textOf(section.querySelector(selector)),
  ).find((text) => text.length > 0);
  if (subtitleSource) subtitle = subtitleSource;

  let body = '';
  const footSpans = section.querySelectorAll('.s-foot span');
  if (footSpans.length > 1) body = textOf(footSpans[footSpans.length - 1]);

  const templateMatch = findTemplateByLabel(label);
  const layout: PresentationLayout = templateMatch?.layout ?? inferLayout(section);

  const imageSource =
    section.querySelector<HTMLImageElement>('img')?.getAttribute('src')?.trim() ?? '';
  const imageUrl = /^https?:\/\//i.test(imageSource) ? imageSource : undefined;

  return {
    slide: {
      id: `slide-${index + 1}`,
      templateId: templateMatch?.id ?? `imported-${layout}`,
      layout,
      variant: templateMatch?.variant ?? 'default',
      eyebrow: eyebrow || (templateMatch ? templateMatch.eyebrow : ''),
      title: title || '슬라이드 제목을 입력하세요',
      subtitle,
      body,
      items: collectItems(section),
      imageUrl,
      speakerNotes: notes[index] ?? '',
      suggestedSeconds:
        templateMatch?.suggestedSeconds ?? (layout === 'cover' || layout === 'closing' ? 45 : 75),
    },
    imageSrc: imageSource,
  };
};

/** pptasset 스타일 deck HTML(section.slide 구조)을 프레젠테이션 문서로 변환한다. */
export const parsePresentationHtml = (html: string): ParseHtmlResult => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const sections = Array.from(doc.querySelectorAll('section.slide'));

  const notes: string[] = (() => {
    try {
      const raw = doc.getElementById('speaker-notes')?.textContent;
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.filter((note): note is string => typeof note === 'string')
        : [];
    } catch {
      return [];
    }
  })();

  const warnings: string[] = [];
  const parsedSlides = sections.map((section, index) => parseSlide(section, index, notes));
  const slides = parsedSlides
    .map((parsed) => parsed.slide)
    .filter((slide): slide is NonNullable<typeof slide> => slide !== null);
  const imageSources: HtmlImageSource[] = parsedSlides.flatMap((parsed, index) =>
    parsed.imageSrc ? [{ slideIndex: index, src: parsed.imageSrc }] : [],
  );

  if (sections.length === 0) {
    warnings.push('NO_SLIDES');
  } else if (slides.length === 0) {
    warnings.push('ALL_SLIDES_DROPPED');
  }
  if (slides.length > 100) {
    warnings.push(`TOO_MANY_SLIDES:${slides.length}`);
  }

  const title =
    textOf(doc.querySelector('title')) ||
    slides.find((slide) => slide.layout === 'cover')?.title ||
    slides[0]?.title ||
    '';

  return {
    document: {
      schemaVersion: PRESENTATION_SCHEMA_VERSION,
      slides: slides.slice(0, 100),
    },
    theme: normalizePresentationTheme(undefined),
    title,
    warnings,
    imageSources,
  };
};

export { getPresentationTemplate };
