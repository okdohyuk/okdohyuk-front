import StringUtils from '@utils/stringUtils';
import { BlogToc } from '~/components/blog/BlogDetail/type';

/**
 * Set unique id for each headings (only for h1, h2, h3)
 * @param html
 */
export function setHeadingId(html: string) {
  const div = document.createElement('div');
  div.innerHTML = html;

  const h1 = div.querySelectorAll('h1');
  const h2 = div.querySelectorAll('h2');
  const h3 = div.querySelectorAll('h3');

  const idList: string[] = [];

  const setId = (element: HTMLHeadingElement) => {
    const id = StringUtils.toUrlSlug(element.innerText);
    const exists = idList.filter((existingId) => existingId.indexOf(id) !== -1);
    const uniqueId = `${id}${exists.length === 0 ? '' : `-${exists.length}`}`;
    element.id = uniqueId;
    idList.push(uniqueId);
  };

  [h1, h2, h3].forEach((elements) => elements.forEach(setId));

  return div.innerHTML;
}

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
