import React from 'react';
import Link from '@components/basic/Link';
import MarkdownTransJSX from 'markdown-to-jsx';
import { cn } from '@utils/cn';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/basic/Table';
import Aside from './Aside';
import CodeWindow from './CodeWindow';
import Heading2 from './Heading2';
import Heading3 from './Heading3';
import Img from './Img';
import { MarkDownProps } from './type';

// One size for th and td (14px). Header row is a surface step with a hairline under it;
// bolded cells (usually the first column acting as a row header) read as fg-1 medium.
// Inline code in cells shrinks so chips don't dominate the row, and never splits mid-token
// (the table scrolls horizontally instead).
const MARKDOWN_TABLE_CLASS = cn(
  'not-prose text-sm leading-6 [&_thead_tr]:border-t-0',
  '[&_strong]:font-medium [&_strong]:text-fg-1',
  '[&_:is(th,td)_code]:whitespace-nowrap [&_:is(th,td)_code]:rounded-xs [&_:is(th,td)_code]:px-1 [&_:is(th,td)_code]:py-px [&_:is(th,td)_code]:text-[0.85em]',
);
const MARKDOWN_TH_CLASS =
  'min-w-32 whitespace-normal break-keep px-3 py-2.5 align-bottom text-sm font-medium text-fg-3';
// Long cells wrap at word boundaries (Korean included) and align to the top.
const MARKDOWN_TD_CLASS = 'min-w-32 break-keep px-3 py-2.5 align-top text-fg-3';

const MarkDown: MarkDownProps = function MarkDown({ contents }) {
  return (
    <MarkdownTransJSX
      className={cn(
        // Reading size: 16px / 1.75 on phones, 18px / 1.78 from md (Tailwind Typography defaults).
        'prose md:prose-lg prose-zinc dark:prose-invert mt-6 mb-14 max-w-none break-words',
        'prose-headings:scroll-mt-24 prose-headings:font-semibold',
        '[&_h1]:!text-fg-1 [&_h2]:!text-fg-1 [&_h3]:!text-fg-1 [&_h4]:!text-fg-1 [&_h5]:!text-fg-1 [&_h6]:!text-fg-1',
        '[&_h1_a]:!text-fg-1 [&_h2_a]:!text-fg-1 [&_h3_a]:!text-fg-1 [&_h4_a]:!text-fg-1 [&_h5_a]:!text-fg-1 [&_h6_a]:!text-fg-1',
        '[&_h1_a:hover]:!text-fg-1 [&_h2_a:hover]:!text-fg-1 [&_h3_a:hover]:!text-fg-1 [&_h4_a:hover]:!text-fg-1 [&_h5_a:hover]:!text-fg-1 [&_h6_a:hover]:!text-fg-1',
        'prose-pre:my-0 prose-table:my-0',
        // Accent ink for links, with a faint underline so they read without colour alone.
        'prose-a:text-point-fg prose-a:font-medium prose-a:underline prose-a:decoration-point-fg/30 prose-a:underline-offset-2',
        '[&_a]:transition-colors [&_a]:duration-150',
        // Heading anchors are self-links, not body links: no underline.
        '[&_:is(h1,h2,h3,h4,h5,h6)_a]:no-underline',
        'hover:prose-a:decoration-point-fg',
        'prose-hr:hidden',
        // Inline code: no typographic backticks, regular weight — the chip already marks it.
        'prose-code:font-medium prose-code:before:content-none prose-code:after:content-none',
        '[&_:not(pre)>code]:rounded-md [&_:not(pre)>code]:border [&_:not(pre)>code]:border-basic-3',
        '[&_:not(pre)>code]:bg-basic-2 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:text-[0.9em]',
      )}
      options={{
        forceBlock: true,
        wrapper: 'div',
        overrides: {
          h2: {
            component: Heading2,
          },
          h3: {
            component: Heading3,
          },
          pre: {
            component: CodeWindow,
          },
          aside: {
            component: Aside,
          },
          // Blog tables reuse the shared Table and only add reading styles here, so other
          // Table users (admin, tools) are untouched. `not-prose` drops Typography's table
          // rules (first-column padding 0, 1em body vs 0.875em header) that fought these.
          table: {
            component: Table,
            props: { className: MARKDOWN_TABLE_CLASS },
          },
          thead: {
            component: TableHeader,
          },
          tbody: {
            component: TableBody,
          },
          tr: {
            component: TableRow,
            props: { className: 'hover:bg-transparent' },
          },
          th: {
            component: TableHead,
            props: { className: MARKDOWN_TH_CLASS },
          },
          td: {
            component: TableCell,
            props: { className: MARKDOWN_TD_CLASS },
          },
          a: {
            component: Link,
            props: {
              hasTargetBlank: true,
            },
          },
          img: {
            component: Img,
          },
        },
      }}
    >
      {contents}
    </MarkdownTransJSX>
  );
};

export default MarkDown;
