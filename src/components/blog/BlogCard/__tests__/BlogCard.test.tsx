import React from 'react';
import { render, screen } from '@testing-library/react';
import { BlogSearch } from '@api/Blog';
import Discript from '../Discript';
import Frame from '../Frame';
import Board from '../Board';
import CardMeta from '../CardMeta';
import ThumbPlaceholder from '../ThumbPlaceholder';

const baseBlog: BlogSearch = {
  id: 1,
  urlSlug: 'nextjs-cache',
  title: 'Next.js 캐시 정리',
  contents: '## 들어가며\n본문 **내용**',
  isPublic: true,
  createdAt: '2026-03-04T09:00:00Z',
  tags: ['nextjs', 'cache', 'react', 'ssr'],
};

const hasHueGradient = (root: HTMLElement) =>
  /bg-gradient|from-|via-|to-violet|violet-/.test(root.innerHTML);

describe('blog cards without a thumbnail', () => {
  it.each([
    ['discript', Discript],
    ['frame', Frame],
    ['board', Board],
  ])('%s renders the neutral placeholder, not a gradient', (_, Card) => {
    const { container } = render(<Card blog={baseBlog} />);
    const placeholder = screen.getByTestId('blog-thumb-placeholder');
    expect(placeholder).toHaveTextContent('N');
    expect(placeholder).toHaveAttribute('aria-hidden');
    expect(hasHueGradient(container)).toBe(false);
  });
});

describe('<ThumbPlaceholder />', () => {
  it('uses the first character of the title, including Hangul', () => {
    render(<ThumbPlaceholder title="  캐시 전략" />);
    expect(screen.getByTestId('blog-thumb-placeholder')).toHaveTextContent('캐');
  });
});

describe('<CardMeta />', () => {
  it('shows an ISO date in tabular mono and at most three tags', () => {
    render(<CardMeta createdAt="2026-03-04T09:00:00Z" tags={baseBlog.tags} />);
    const time = screen.getByText('2026-03-04');
    expect(time.tagName).toBe('TIME');
    expect(time).toHaveClass('font-mono', 'tabular-nums');
    expect(screen.getByText('#cache')).toBeInTheDocument();
    expect(screen.queryByText('#ssr')).toBeNull();
  });

  it('omits the date when it is invalid', () => {
    const { container } = render(<CardMeta createdAt="not-a-date" />);
    expect(container.querySelector('time')).toBeNull();
  });
});
