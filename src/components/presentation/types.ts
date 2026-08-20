export const PRESENTATION_SCHEMA_VERSION = 1 as const;

export type PresentationLayout =
  | 'cover'
  | 'agenda'
  | 'glossary'
  | 'quote'
  | 'stat'
  | 'concept'
  | 'columns'
  | 'cycle'
  | 'list'
  | 'cards'
  | 'split'
  | 'table'
  | 'status'
  | 'implications'
  | 'perspective'
  | 'summary'
  | 'matrix'
  | 'roadmap'
  | 'journey'
  | 'chart'
  | 'media'
  | 'timeline'
  | 'swot'
  | 'risk'
  | 'faq'
  | 'heroStat'
  | 'process'
  | 'closing';

export type PresentationAccent = 'violet' | 'teal' | 'pink' | 'amber';

export interface PresentationTheme {
  [key: string]: unknown;
  themePreset: 'okdohyuk';
  accent: PresentationAccent;
}

export interface PresentationSlide {
  id: string;
  templateId: string;
  layout: PresentationLayout;
  variant: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
  items: string[];
  speakerNotes: string;
  suggestedSeconds: number;
}

export interface PresentationDocument {
  [key: string]: unknown;
  schemaVersion: typeof PRESENTATION_SCHEMA_VERSION;
  slides: PresentationSlide[];
}

export interface PresentationTemplateDefinition {
  id: string;
  name: string;
  category: string;
  layout: PresentationLayout;
  variant: string;
  eyebrow: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultBody: string;
  defaultItems: string[];
  suggestedSeconds: number;
}

export interface PresentationThemeTokens {
  point1: string;
  point2: string;
  point3: string;
  point4: string;
  canvas: string;
  surface: string;
  fg1: string;
  fg3: string;
  fg5: string;
}

export const PRESENTATION_THEME_TOKENS: Record<PresentationAccent, PresentationThemeTokens> = {
  violet: {
    point1: '#6D28D9',
    point2: '#7C3AED',
    point3: '#8B5CF6',
    point4: '#DDD6FE',
    canvas: '#FAFAFA',
    surface: '#FFFFFF',
    fg1: '#18181B',
    fg3: '#3F3F46',
    fg5: '#71717A',
  },
  teal: {
    point1: '#0F766E',
    point2: '#0D9488',
    point3: '#2DD4BF',
    point4: '#CCFBF1',
    canvas: '#F8FAFC',
    surface: '#FFFFFF',
    fg1: '#18181B',
    fg3: '#3F3F46',
    fg5: '#71717A',
  },
  pink: {
    point1: '#BE185D',
    point2: '#DB2777',
    point3: '#F472B6',
    point4: '#FCE7F3',
    canvas: '#FFF7FB',
    surface: '#FFFFFF',
    fg1: '#18181B',
    fg3: '#3F3F46',
    fg5: '#71717A',
  },
  amber: {
    point1: '#B45309',
    point2: '#D97706',
    point3: '#FBBF24',
    point4: '#FEF3C7',
    canvas: '#FFFCF5',
    surface: '#FFFFFF',
    fg1: '#18181B',
    fg3: '#3F3F46',
    fg5: '#71717A',
  },
};

export const DEFAULT_PRESENTATION_THEME: PresentationTheme = {
  themePreset: 'okdohyuk',
  accent: 'violet',
};

export const isPresentationLayout = (value: unknown): value is PresentationLayout =>
  typeof value === 'string' &&
  [
    'cover',
    'agenda',
    'glossary',
    'quote',
    'stat',
    'concept',
    'columns',
    'cycle',
    'list',
    'cards',
    'split',
    'table',
    'status',
    'implications',
    'perspective',
    'summary',
    'matrix',
    'roadmap',
    'journey',
    'chart',
    'media',
    'timeline',
    'swot',
    'risk',
    'faq',
    'heroStat',
    'process',
    'closing',
  ].includes(value);

const toStringValue = (value: unknown, fallback = '') =>
  typeof value === 'string' ? value : fallback;

const toItems = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

const toSlide = (value: unknown, index: number): PresentationSlide | null => {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  if (!isPresentationLayout(candidate.layout)) return null;
  return {
    id: toStringValue(candidate.id, `slide-${index + 1}`),
    templateId: toStringValue(candidate.templateId, `${candidate.layout}-${index + 1}`),
    layout: candidate.layout,
    variant: toStringValue(candidate.variant, 'default'),
    eyebrow: toStringValue(candidate.eyebrow, 'Presentation'),
    title: toStringValue(candidate.title, '슬라이드 제목을 입력하세요'),
    subtitle: toStringValue(candidate.subtitle),
    body: toStringValue(candidate.body),
    items: toItems(candidate.items),
    speakerNotes: toStringValue(candidate.speakerNotes),
    suggestedSeconds:
      typeof candidate.suggestedSeconds === 'number' && candidate.suggestedSeconds >= 0
        ? candidate.suggestedSeconds
        : 60,
  };
};

export const normalizePresentationDocument = (value: unknown): PresentationDocument => {
  const candidate = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const rawSlides = Array.isArray(candidate.slides) ? candidate.slides : [];
  const slides = rawSlides
    .map(toSlide)
    .filter((slide): slide is PresentationSlide => slide !== null);
  return {
    schemaVersion: PRESENTATION_SCHEMA_VERSION,
    slides,
  };
};

export const normalizePresentationTheme = (value: unknown): PresentationTheme => {
  const candidate = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const { accent } = candidate;
  return {
    themePreset: 'okdohyuk',
    accent:
      accent === 'teal' || accent === 'pink' || accent === 'amber' || accent === 'violet'
        ? accent
        : DEFAULT_PRESENTATION_THEME.accent,
  };
};
