import markdownUtils from '../markdownUtils';

describe('markdownUtils', () => {
  describe('removeMarkdown', () => {
    it('마크다운이 없는 일반 텍스트는 그대로 반환해야 합니다', () => {
      const text = 'This is a plain text.';
      expect(markdownUtils.removeMarkdown(text)).toBe(text);
    });

    it('빈 문자열을 입력하면 빈 문자열을 반환해야 합니다', () => {
      expect(markdownUtils.removeMarkdown('')).toBe('');
    });

    // 기본 옵션 테스트
    describe('기본 옵션 동작', () => {
      it('헤더 마크다운을 제거해야 합니다', () => {
        const markdown =
          '# Header 1\n## Header 2\n### Header 3\nHeader 4\n========\nHeader 5\n--------';
        const expected = 'Header 1\nHeader 2\nHeader 3\nHeader 4\nHeader 5';
        // 기본적으로 ATX 스타일 헤더의 #과 Setext 스타일 헤더의 ===, ---가 제거됩니다.
        // ATX 스타일 # 뒤 공백, Setext 스타일 밑줄 앞뒤 공백/개행 처리도 확인 필요.
        // 현재 로직은 #만 제거하고, ===, ---는 제거 후 개행을 남길 수 있음.
        // 정규식에 따라 결과가 달라질 수 있으므로, 실제 로직 기반으로 기대값 조정 필요.
        // 예시: '# Header' -> 'Header', 'Header\n==' -> 'Header'
        expect(
          markdownUtils
            .removeMarkdown(markdown)
            .replace(/\n{2,}/g, '\n')
            .trim(),
        ).toBe(expected.trim());
      });

      it('리스트 마커를 제거해야 합니다 (기본: stripListLeaders=true)', () => {
        const markdown = '- Item 1\n* Item 2\n+ Item 3\n1. Item 4';
        const expected = 'Item 1\nItem 2\nItem 3\nItem 4';
        expect(markdownUtils.removeMarkdown(markdown)).toBe(expected);
      });

      it('인라인 코드와 코드 블록 마크다운을 제거해야 합니다', () => {
        const markdown = 'This is `inline code`.\n```javascript\nconst x = 1;\n```';
        const expected = 'This is inline code.\nconst x = 1;'; // gfm 옵션에 따라 fenced code block 처리
        expect(markdownUtils.removeMarkdown(markdown).replace(/\s*\n\s*/g, '\n')).toBe(expected);
      });

      it('강조 마크다운(*, _)을 제거해야 합니다', () => {
        const markdown = '*italic* _italic_ **bold** __bold__ ***bold italic*** ___bold italic___';
        const expected = 'italic italic bold bold bold italic bold italic';
        expect(markdownUtils.removeMarkdown(markdown)).toBe(expected);
      });

      it('링크 마크다운을 제거하고 텍스트만 남겨야 합니다 (기본: preserveLinks=false)', () => {
        const markdown = '[link text](http://example.com)';
        const expected = 'link text';
        expect(markdownUtils.removeMarkdown(markdown)).toBe(expected);
      });

      it('이미지 마크다운을 제거하고 alt 텍스트를 남겨야 합니다 (기본: useImgAltText=true)', () => {
        const markdown = '![alt text](image.jpg)';
        const expected = 'alt text';
        expect(markdownUtils.removeMarkdown(markdown)).toBe(expected);
      });

      it('인용구 마크다운을 제거해야 합니다', () => {
        const markdown = '> This is a quote.\n>> This is a nested quote.';
        const expected = 'This is a quote.\nThis is a nested quote.';
        // 실제로는 개행이 추가될 수 있음: 'This is a quote.\n\nThis is a nested quote.'
        expect(markdownUtils.removeMarkdown(markdown).replace(/\n\n/g, '\n').trim()).toBe(expected);
      });

      it('수평선 마크다운을 제거해야 합니다', () => {
        const markdown = 'Text above\n***\nText below\n---';
        const expected = 'Text above\nText below';
        expect(markdownUtils.removeMarkdown(markdown).replace(/\n+/g, '\n').trim()).toBe(
          expected.trim(),
        );
      });

      it('HTML 태그를 제거해야 합니다', () => {
        const markdown = '<p>Paragraph with <strong>bold</strong> text.</p>';
        const expected = 'Paragraph with bold text.';
        expect(markdownUtils.removeMarkdown(markdown)).toBe(expected);
      });

      it('GFM 취소선을 제거해야 합니다 (기본: gfm=true)', () => {
        const markdown = '~~strikethrough~~';
        const expected = 'strikethrough';
        expect(markdownUtils.removeMarkdown(markdown)).toBe(expected);
      });
    });
  });
});
