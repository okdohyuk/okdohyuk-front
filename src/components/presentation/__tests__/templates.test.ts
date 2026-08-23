import { describe, expect, it } from 'vitest';
import {
  createStarterPresentationDocument,
  createSlideFromTemplate,
  PRESENTATION_TEMPLATES,
} from '../templates';

describe('presentation templates', () => {
  it('provides the 59 pptasset reference templates', () => {
    expect(PRESENTATION_TEMPLATES).toHaveLength(59);
    expect(PRESENTATION_TEMPLATES.map((template) => template.id)).toContain('closing');
    expect(PRESENTATION_TEMPLATES.map((template) => template.id)).toContain('scatter-quadrant');
  });

  it('creates a starter document with projection-ready opening and closing slides', () => {
    const document = createStarterPresentationDocument();

    expect(document.schemaVersion).toBe(1);
    expect(document.slides.map((slide) => slide.templateId)).toEqual([
      'cover',
      'agenda',
      'closing',
    ]);
    expect(document.slides.every((slide) => slide.suggestedSeconds > 0)).toBe(true);
  });

  it('creates independent slide content for each template', () => {
    const first = createSlideFromTemplate('agenda');
    const second = createSlideFromTemplate('agenda');

    expect(first.id).not.toBe(second.id);
    expect(first.items).not.toBe(second.items);
    expect(first.layout).toBe('agenda');
  });
});
