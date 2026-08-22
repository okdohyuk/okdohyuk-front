import { describe, expect, it } from 'vitest';
import { normalizePresentationDocument, normalizePresentationTheme } from '../types';

describe('presentation document normalization', () => {
  it('keeps valid slides and drops unknown layouts', () => {
    const document = normalizePresentationDocument({
      schemaVersion: 99,
      slides: [
        { layout: 'cover', title: 'Valid', items: ['one'] },
        { layout: 'unsafe-html', title: 'Dropped' },
      ],
    });

    expect(document.schemaVersion).toBe(1);
    expect(document.slides).toHaveLength(1);
    expect(document.slides[0].title).toBe('Valid');
    expect(document.slides[0].speakerNotes).toBe('');
  });

  it('preserves imageUrl and drops empty values', () => {
    const document = normalizePresentationDocument({
      slides: [
        { layout: 'media', title: 'With image', imageUrl: 'https://example.com/a.png' },
        { layout: 'media', title: 'Empty image', imageUrl: '' },
      ],
    });

    expect(document.slides[0].imageUrl).toBe('https://example.com/a.png');
    expect(document.slides[1].imageUrl).toBeUndefined();
  });

  it('falls back to the okdohyuk violet theme', () => {
    expect(normalizePresentationTheme({ themePreset: 'other', accent: 'unknown' })).toEqual({
      themePreset: 'okdohyuk',
      accent: 'violet',
    });
    expect(normalizePresentationTheme({ accent: 'teal' }).accent).toBe('teal');
  });
});
