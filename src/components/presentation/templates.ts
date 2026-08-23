import type {
  PresentationDocument,
  PresentationSlide,
  PresentationTemplateDefinition,
} from './types';
import { PRESENTATION_SCHEMA_VERSION } from './types';

const genericItems = (layout: PresentationTemplateDefinition['layout']): string[] => {
  switch (layout) {
    case 'agenda':
      return ['배경과 문제', '핵심 인사이트', '실행 계획', '마무리와 다음 행동'];
    case 'stat':
    case 'heroStat':
      return ['00% — 첫 번째 핵심 지표', '+00 — 변화량 또는 비교 기준', '2026 — 기준 연도'];
    case 'columns':
    case 'split':
      return [
        '왼쪽 관점 또는 현재 상태',
        '오른쪽 관점 또는 목표 상태',
        '두 내용을 연결하는 판단 기준',
      ];
    case 'cycle':
    case 'process':
    case 'timeline':
    case 'roadmap':
      return [
        '첫 번째 단계 — 시작 조건과 산출물',
        '두 번째 단계 — 검증할 결과',
        '세 번째 단계 — 다음 행동',
      ];
    case 'table':
    case 'matrix':
    case 'risk':
      return ['항목 A — 기준 — 설명', '항목 B — 기준 — 설명', '항목 C — 기준 — 설명'];
    case 'chart':
      return ['Segment A — 72', 'Segment B — 54', 'Segment C — 38', '목표선 — 80'];
    case 'quote':
    case 'faq':
      return ['핵심 질문 또는 인용문', '답변·근거·출처를 입력하세요'];
    case 'glossary':
    case 'cards':
    case 'journey':
    case 'swot':
      return [
        '핵심 항목 1 — 설명을 입력하세요',
        '핵심 항목 2 — 설명을 입력하세요',
        '핵심 항목 3 — 설명을 입력하세요',
      ];
    default:
      return ['핵심 메시지 1을 입력하세요', '핵심 메시지 2를 입력하세요', '다음 행동을 입력하세요'];
  }
};

const spec = (
  id: string,
  name: string,
  category: string,
  layout: PresentationTemplateDefinition['layout'],
  variant = 'default',
): PresentationTemplateDefinition => ({
  id,
  name,
  category,
  layout,
  variant,
  eyebrow: `${category} · ${name}`,
  defaultTitle: name,
  defaultSubtitle: '핵심 메시지와 발표 맥락을 한 문장으로 입력하세요.',
  defaultBody: '이 슬라이드의 목적과 발표자가 전달할 핵심 내용을 짧게 입력하세요.',
  defaultItems: genericItems(layout),
  suggestedSeconds: layout === 'cover' || layout === 'closing' ? 45 : 75,
});

/** pptasset/deck.html 59개 reference slide를 typed family/variant로 제공한다. */
export const PRESENTATION_TEMPLATES: PresentationTemplateDefinition[] = [
  spec('cover', '표지', 'Basic', 'cover'),
  spec('agenda', '목차', 'Basic', 'agenda'),
  spec('glossary', '용어 정리', 'Basic', 'glossary'),
  spec('problem', '문제 제기', 'Basic', 'quote'),
  spec('stat-cards', '지표 카드', 'Basic', 'stat'),
  spec('concept-card', '개념 카드', 'Basic', 'concept'),
  spec('two-columns', '두 단 구성', 'Basic', 'columns'),
  spec('cycle', '순환 다이어그램', 'Basic', 'cycle'),
  spec('numbered-list', '번호 목록', 'Basic', 'list'),
  spec('three-cards', '세 가지 조건', 'Basic', 'cards'),
  spec('split-comparison', '분할 비교', 'Basic', 'split'),
  spec('table', '표 예시', 'Basic', 'table'),
  spec('status', '현황 정리', 'Basic', 'status'),
  spec('implications', '시사점', 'Basic', 'implications'),
  spec('perspective', '의견 정리', 'Basic', 'perspective'),
  spec('strategy-summary', 'Strategy Executive Summary', 'Strategy', 'summary'),
  spec('decision-matrix', 'Strategy Decision Matrix', 'Strategy', 'matrix'),
  spec('roadmap', 'Strategy Roadmap', 'Strategy', 'roadmap'),
  spec('user-journey', 'Product User Journey', 'Product', 'journey'),
  spec('feature-priority', 'Product Feature Prioritization', 'Product', 'matrix', 'priority'),
  spec('before-after', 'Product Before/After Transformation', 'Product', 'split', 'before-after'),
  spec('findings-summary', 'Research Findings Summary', 'Research', 'glossary', 'findings'),
  spec('persona', 'Research Persona Snapshot', 'Research', 'columns', 'persona'),
  spec('trend-line', 'Data Trend Line', 'Data', 'chart', 'line'),
  spec('segment-breakdown', 'Data Segment Breakdown', 'Data', 'chart', 'bar'),
  spec('kpi-dashboard', 'Data KPI Dashboard', 'Data', 'stat', 'kpi'),
  spec('grouped-bar', 'Graph Vertical / Grouped Bar', 'Graph', 'chart', 'bar'),
  spec('pie-donut', 'Graph Pie + Donut Share', 'Graph', 'chart', 'donut'),
  spec('scatter-quadrant', 'Graph Scatter / Quadrant Map', 'Graph', 'chart', 'scatter'),
  spec('tree-diagram', 'Graph Tree Diagram', 'Graph', 'chart', 'tree'),
  spec('treemap', 'Graph Treemap / Hierarchical Share', 'Graph', 'chart', 'treemap'),
  spec('pricing', 'Sales Pricing Comparison', 'Sales', 'table', 'pricing'),
  spec('workshop', 'Workshop Activity Guide', 'Workshop', 'cards'),
  spec('learning-goals', 'Lecture Learning Goals', 'Lecture', 'list'),
  spec('prerequisites', 'Lecture Prerequisites', 'Lecture', 'glossary'),
  spec('walkthrough', 'Lecture Walkthrough Steps', 'Lecture', 'process'),
  spec('code-example', 'Lecture Code Example', 'Lecture', 'columns', 'code'),
  spec('quiz-check', 'Lecture Quiz / Check', 'Lecture', 'cards', 'quiz'),
  spec('hands-on', 'Lecture Hands-on Activity', 'Lecture', 'cards', 'hands-on'),
  spec('recap', 'Lecture Recap / Key Points', 'Lecture', 'summary'),
  spec('full-bleed-image', 'Media Full-bleed Image', 'Media', 'media', 'full-bleed'),
  spec('image-caption', 'Media Image with Caption', 'Media', 'media', 'caption'),
  spec('screenshot-annotated', 'Media Screenshot Annotated', 'Media', 'media', 'annotation'),
  spec('compare-two-up', 'Media Compare 2-up', 'Media', 'media', 'compare'),
  spec('video-placeholder', 'Media Video Embed Placeholder', 'Media', 'media', 'video'),
  spec('device-mockup', 'Media Device Mockup', 'Media', 'media', 'device'),
  spec('section-divider', 'Ops Section Divider', 'Ops', 'cover', 'divider'),
  spec('about-speaker', 'Ops About Speaker', 'Ops', 'columns', 'speaker'),
  spec('team-roster', 'Ops Team Roster', 'Ops', 'cards', 'team'),
  spec('qr-resources', 'Ops QR + Resources', 'Ops', 'columns', 'resources'),
  spec('discussion', 'Ops Discussion / Q&A', 'Ops', 'quote', 'qa'),
  spec('action-items', 'Ops Action Items', 'Ops', 'table', 'actions'),
  spec('milestones', 'Timeline Milestones', 'Framework', 'timeline'),
  spec('swot', 'SWOT 분석', 'Framework', 'swot'),
  spec('risk-matrix', 'Risk Matrix', 'Framework', 'risk'),
  spec('faq', 'FAQ', 'Framework', 'faq'),
  spec('big-hero-stat', 'Big Hero Stat', 'Closing', 'heroStat'),
  spec('process-flow', 'Process Flow', 'Closing', 'process'),
  spec('closing', 'Closing', 'Closing', 'closing'),
];

let slideSequence = 0;

const nextSlideId = () => {
  slideSequence += 1;
  return `slide-${slideSequence}`;
};

export const getPresentationTemplate = (templateId: string) =>
  PRESENTATION_TEMPLATES.find((template) => template.id === templateId) ??
  PRESENTATION_TEMPLATES[0];

export const createSlideFromTemplate = (templateId: string): PresentationSlide => {
  const template = getPresentationTemplate(templateId);
  return {
    id: nextSlideId(),
    templateId: template.id,
    layout: template.layout,
    variant: template.variant,
    eyebrow: template.eyebrow,
    title: template.defaultTitle,
    subtitle: template.defaultSubtitle,
    body: template.defaultBody,
    items: [...template.defaultItems],
    speakerNotes: `${template.name} 템플릿입니다. 발표 맥락에 맞게 빈칸을 치환하세요.`,
    suggestedSeconds: template.suggestedSeconds,
  };
};

export const createStarterPresentationDocument = (): PresentationDocument => ({
  schemaVersion: PRESENTATION_SCHEMA_VERSION,
  slides: ['cover', 'agenda', 'closing'].map(createSlideFromTemplate),
});

export const duplicateSlide = (slide: PresentationSlide): PresentationSlide => ({
  ...slide,
  id: nextSlideId(),
  title: `${slide.title} (복제)`,
  items: [...slide.items],
});
