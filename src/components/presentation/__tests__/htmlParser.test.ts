import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parsePresentationHtml } from '../htmlParser';

const TEMPLATE_PATH = join(__dirname, '../../../../public/ppt/template.html');

describe('parsePresentationHtml', () => {
  it('parses the shipped template.html into normalized slides', () => {
    const html = readFileSync(TEMPLATE_PATH, 'utf8');
    const result = parsePresentationHtml(html);

    expect(result.warnings).not.toContain('NO_SLIDES');
    expect(result.document.slides.length).toBe(15);
    expect(result.document.schemaVersion).toBe(1);
    expect(result.theme.accent).toBe('violet');
  });

  it('maps cover slide fields from the template', () => {
    const html = readFileSync(TEMPLATE_PATH, 'utf8');
    const { document } = parsePresentationHtml(html);

    const cover = document.slides[0];
    expect(cover.layout).toBe('cover');
    expect(cover.templateId).toBe('cover');
    expect(cover.eyebrow).toContain('프레젠테이션 템플릿');
    expect(cover.title).toContain('프레젠테이션');
  });

  it('matches data-label against template names for layout inference', () => {
    const html = readFileSync(TEMPLATE_PATH, 'utf8');
    const { document } = parsePresentationHtml(html);

    expect(document.slides.map((slide) => slide.layout)).toEqual([
      'cover',
      'agenda',
      'glossary',
      'stat',
      'concept',
      'columns',
      'list',
      'cards',
      'table',
      'roadmap',
      'chart',
      'media',
      'timeline',
      'swot',
      'closing',
    ]);
  });

  it('collects list items with title-description joins', () => {
    const html = readFileSync(TEMPLATE_PATH, 'utf8');
    const { document } = parsePresentationHtml(html);

    const listSlide = document.slides.find((slide) => slide.layout === 'list');
    expect(listSlide?.items.length).toBeGreaterThanOrEqual(3);
    expect(listSlide?.items[0]).toContain('첫 번째 항목 제목입니다');
    expect(listSlide?.items[0]).toContain('—');
  });

  it('attaches speaker notes by slide order', () => {
    const html = readFileSync(TEMPLATE_PATH, 'utf8');
    const { document } = parsePresentationHtml(html);

    expect(document.slides[0].speakerNotes).toContain('표지');
  });

  it('falls back to heuristic layouts when labels do not match templates', () => {
    const html = `<!doctype html><html><head><title>커스텀 덱</title></head><body>
      <section class="slide cover" data-label="01 오프닝"><h1>오프닝</h1></section>
      <section class="slide" data-label="02 알 수 없는 라벨">
        <div class="eyebrow">X · Y</div>
        <h1>본문 슬라이드</h1>
        <ul><li>항목 하나</li><li>항목 둘</li></ul>
      </section>
    </body></html>`;
    const result = parsePresentationHtml(html);

    expect(result.title).toBe('커스텀 덱');
    expect(result.document.slides[0].layout).toBe('cover');
    // "알 수 없는 라벨"은 템플릿 이름과 매칭되지 않으므로 구조 휴리스틱(list) 적용
    expect(result.document.slides[1].layout).toBe('list');
    expect(result.document.slides[1].items).toEqual(['항목 하나', '항목 둘']);
  });

  it('reports NO_SLIDES for html without slide sections', () => {
    const result = parsePresentationHtml('<!doctype html><html><body><p>빈 문서</p></body></html>');

    expect(result.warnings).toContain('NO_SLIDES');
    expect(result.document.slides).toHaveLength(0);
  });

  it('maps http image sources to slide imageUrl and ignores data URLs', () => {
    const html = `<!doctype html><html><body>
      <section class="slide" data-label="41 Media Full-bleed Image">
        <h1>이미지 슬라이드</h1>
        <img src="https://cdn.example.com/photo.png" alt="사진" />
      </section>
      <section class="slide" data-label="42 Media Image with Caption">
        <h1>인라인 이미지</h1>
        <img src="data:image/png;base64,AAAA" alt="인라인" />
      </section>
    </body></html>`;
    const { document } = parsePresentationHtml(html);

    expect(document.slides[0].imageUrl).toBe('https://cdn.example.com/photo.png');
    expect(document.slides[1].imageUrl).toBeUndefined();
  });
});
