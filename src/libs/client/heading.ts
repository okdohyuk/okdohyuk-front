import { BlogToc } from '@components/legacy/blog/BlogDetail/type';

/**
 * Parses heading for building TOC
 * @param html
 * @returns BlogToc[]
 */
export function parseHeadings(html: string): BlogToc[] {
  const div = document.createElement('div');
  div.innerHTML = html;

  const headings = Array.from(div.querySelectorAll('article > h1, article > h2, article > h3'));

  const headingsInfo = headings.map((heading) => ({
    id: heading.id,
    text: heading.textContent + '',
    level: parseInt(heading.tagName.replace('H', ''), 10),
  }));

  const minLevel = Math.min(...Array.from(headingsInfo.map((info) => info.level)));

  headingsInfo.forEach((info) => {
    info.level -= minLevel;
  });

  return headingsInfo;
}
