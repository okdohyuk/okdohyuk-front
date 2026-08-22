import { describe, expect, it } from 'vitest';
import { buildPrompt } from '../PromptBuilder';

describe('presentation prompt builder', () => {
  it('generates a copyable JSON contract prompt without calling a model', () => {
    const prompt = buildPrompt(
      {
        topic: '웹 접근성',
        purpose: '팀 교육',
        audience: '프론트엔드 개발자',
        slideCount: '8',
        keyMessages: '키보드 탐색\n명도 대비',
        tone: '실용적',
        references: 'WCAG 공식 문서',
      },
      'ko',
      { themePreset: 'okdohyuk', accent: 'violet' },
    );

    expect(prompt).toContain('웹 접근성');
    expect(prompt).toContain('"schemaVersion": 1');
    expect(prompt).toContain('speakerNotes');
    expect(prompt).toContain('JSON 하나만 반환한다');
  });

  it('embeds exact design-system rgb hex values for the selected accent', () => {
    const prompt = buildPrompt(
      {
        topic: '',
        purpose: '',
        audience: '',
        slideCount: '10',
        keyMessages: '',
        tone: '',
        references: '',
      },
      'ko',
      { themePreset: 'okdohyuk', accent: 'violet' },
    );

    expect(prompt).toContain('- point1 (deep/hover): #6D28D9');
    expect(prompt).toContain('- point2 (primary CTA): #7C3AED');
    expect(prompt).toContain('- canvas (슬라이드 배경): #FAFAFA');
    expect(prompt).toContain('위 RGB hex값을 그대로 사용한다');
  });

  it('swaps the color table when the accent changes', () => {
    const prompt = buildPrompt(
      {
        topic: '',
        purpose: '',
        audience: '',
        slideCount: '10',
        keyMessages: '',
        tone: '',
        references: '',
      },
      'en',
      { themePreset: 'okdohyuk', accent: 'teal' },
    );

    expect(prompt).toContain('- point2 (primary CTA): #0D9488');
    expect(prompt).not.toContain('#7C3AED');
  });
});
