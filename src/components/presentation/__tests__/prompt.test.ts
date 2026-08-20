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
});
