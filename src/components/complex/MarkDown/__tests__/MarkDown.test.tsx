import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import MarkDown from '..';

// A leading paragraph keeps markdown-to-jsx from merging the root className onto a lone table.
const TABLE_MD = `
도입 문단

| 항목 | 값 |
| --- | --- |
| **디스크** | \`simctl\` 42GB |
`;

describe('MarkDown', () => {
  it('applies blog-only table overrides on top of the shared Table', () => {
    const { container } = render(<MarkDown contents={TABLE_MD} />);
    const table = container.querySelector('table');
    const th = screen.getByRole('columnheader', { name: '항목' });
    const td = screen.getByRole('cell', { name: /42GB/ });

    expect(table).toHaveClass('not-prose', 'text-sm');
    // th: same size as td, medium fg-3; the shared text-xs / fg-5 / nowrap are merged away.
    expect(th).toHaveClass('text-sm', 'font-medium', 'text-fg-3', 'px-3', 'whitespace-normal');
    expect(th).not.toHaveClass('text-xs', 'text-fg-5', 'whitespace-nowrap');
    expect(td).toHaveClass('align-top', 'break-keep', 'px-3', 'tabular-nums');
    expect(td).not.toHaveClass('align-middle');
  });

  it('renders fenced code highlighted at render time with a language label', () => {
    const { container } = render(<MarkDown contents={'intro\n\n```swift\nlet a = 1\n```'} />);
    const code = container.querySelector('code[data-language="swift"]');

    expect(code?.querySelector('.token.keyword')?.textContent).toBe('let');
    expect(screen.getByText('swift')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();
  });

  it('renders a fence without language as plain escaped text and no label', () => {
    const { container } = render(<MarkDown contents={'intro\n\n```\n<script>x</script>\n```'} />);
    const code = container.querySelector('code[data-language="plain"]');

    expect(code?.textContent).toBe('<script>x</script>');
    expect(code?.querySelector('script')).toBeNull();
  });
});
