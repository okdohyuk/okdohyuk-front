type Options = {
  stripListLeaders?: boolean;
  listUnicodeChar?: string | boolean;
  gfm?: boolean;
  useImgAltText?: boolean;
  preserveLinks?: boolean;
};

const defaultOptions: Required<Options> = {
  stripListLeaders: true,
  listUnicodeChar: '',
  gfm: true,
  useImgAltText: true,
  preserveLinks: false,
};

export default class MarkdownUtils {
  static removeMarkdown = (markdown: string, options: Options = defaultOptions) => {
    const settings = { ...defaultOptions, ...options };

    let output = markdown || '';

    // Remove horizontal rules (stripListHeaders conflict with this rule, which is why it has been moved to the top)
    output = output.replace(/^(-\s*?|\*\s*?|_\s*?){3,}\s*$/gm, '');

    try {
      if (settings.stripListLeaders) {
        if (settings.listUnicodeChar) {
          output = output.replace(/^([\s\t]*)([-*+]|\d+\.)\s+/gm, `${settings.listUnicodeChar} $1`);
        } else {
          output = output.replace(/^([\s\t]*)([-*+]|\d+\.)\s+/gm, '$1');
        }
      }
      if (settings.gfm) {
        output = output
          // 헤더 마크다운 제거
          .replace(/\n={2,}/g, '\n')
          // GFM 취소선 마크다운 제거
          .replace(/~~/g, ''); // 코드블록 마크다운은 아래에서 한 번에 처리
      }
      if (settings.preserveLinks) {
        // Remove inline links while preserving the links
        output = output
          .replace(/\[([^\]]+)]\(([^)]+)\)/g, '$1 ($2)')
          .replace(/\[([^\]]+)]\[([^\]]+)]/g, '$1 ($2)');
      }
      output = output
        // Remove HTML tags
        .replace(/<[^>]*>/g, '')
        // Remove setext-style headers
        .replace(/^[=-]{2,}\s*$/g, '')
        // Remove footnotes?
        .replace(/\[\^.+?\](: .*?$)?/g, '')
        .replace(/\s{0,2}\[.*?\]: .*?$/g, '')
        // Remove images
        .replace(/!\[([^\]]*?)]\(([^)]*?)\)/g, settings.useImgAltText ? '$1' : '')
        .replace(/!\[([^\]]*?)]\[[^\]]*]/g, settings.useImgAltText ? '$1' : '')
        // Remove inline links
        .replace(/\[([^\]]+)]\(([^)]+)\)/g, '$1')
        .replace(/\[([^\]]+)]\[[^\]]*]/g, '$1')
        // Remove blockquotes
        .replace(/^\s{0,3}>\s?/gm, '') // 각 줄의 > 제거
        .replace(/(^|\n)\s{0,3}>\s?/g, '\n') // 중첩 인용구도 \n으로 통일
        // Remove reference-style links?
        .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, '')
        // Remove atx-style headers
        .replace(/^(\n)?\s{0,}#{1,6}\s+| {0,}(\n)?\s{0,}#{0,} {0,}(\n)?\s{0,}$/gm, '$1$2$3')
        // Remove emphasis (repeat the line to remove double emphasis)
        .replace(/([*_]{1,3})(\S.*?\S{0,1})\1/g, '$2')
        .replace(/([*_]{1,3})(\S.*?\S{0,1})\1/g, '$2')
        // 코드블록의 시작(```[언어])과 끝(```), 내부/끝에 개행이 있든 없든, 마지막 ```가 줄 끝이든 파일 끝이든 모두 완벽하게 제거. 내부 코드는 가공하지 않고 그대로 남김
        .replace(/```[ \t]*[a-zA-Z0-9]*\s*\n?([\s\S]*?)\n?```[ \t]*(\n|$)/g, '$1')
        // 혹시 남아있는 ``` 단독 라인, 줄 끝, 파일 끝 모두 제거
        .replace(/(^|\n)```[ \t]*($|\n|$)/g, '$1')
        .replace(/```+[ \t]*($|\n|$)/g, '')
        // 마지막 남은 개행/공백 모두 제거
        .replace(/[\n\r\s]+$/g, '')
        .trim()
        // Remove inline code
        .replace(/`([^`]+?)`/g, '$1')
        // Replace two or more newlines with exactly one
        .replace(/\n{2,}/g, '\n');
    } catch (error) {
      return markdown;
    }
    return output;
  };
}
