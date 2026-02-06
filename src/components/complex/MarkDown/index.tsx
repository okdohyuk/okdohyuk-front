import React from 'react';
import Link from '@components/basic/Link';
import MarkdownTransJSX from 'markdown-to-jsx';
import { cn } from '@utils/cn';
import Aside from './Aside';
import CodeWindow from './CodeWindow';
import Heading2 from './Heading2';
import Heading3 from './Heading3';
import Img from './Img';
import Table from './Table';
import { MarkDownProps } from './type';

const MarkDown: MarkDownProps = function MarkDown({ contents }) {
  return (
    <MarkdownTransJSX
      className={cn(
        'prose prose-zinc dark:prose-invert mt-6 mb-14 max-w-none break-words',
        'prose-headings:scroll-mt-24 prose-headings:tracking-tight',
        '[&_h1]:!text-zinc-900 [&_h2]:!text-zinc-900 [&_h3]:!text-zinc-900 [&_h4]:!text-zinc-900 [&_h5]:!text-zinc-900 [&_h6]:!text-zinc-900',
        'dark:[&_h1]:!text-zinc-100 dark:[&_h2]:!text-zinc-100 dark:[&_h3]:!text-zinc-100 dark:[&_h4]:!text-zinc-100 dark:[&_h5]:!text-zinc-100 dark:[&_h6]:!text-zinc-100',
        '[&_h1_a]:!text-zinc-900 [&_h2_a]:!text-zinc-900 [&_h3_a]:!text-zinc-900 [&_h4_a]:!text-zinc-900 [&_h5_a]:!text-zinc-900 [&_h6_a]:!text-zinc-900',
        'dark:[&_h1_a]:!text-zinc-100 dark:[&_h2_a]:!text-zinc-100 dark:[&_h3_a]:!text-zinc-100 dark:[&_h4_a]:!text-zinc-100 dark:[&_h5_a]:!text-zinc-100 dark:[&_h6_a]:!text-zinc-100',
        '[&_h1_a:hover]:!text-zinc-900 [&_h2_a:hover]:!text-zinc-900 [&_h3_a:hover]:!text-zinc-900 [&_h4_a:hover]:!text-zinc-900 [&_h5_a:hover]:!text-zinc-900 [&_h6_a:hover]:!text-zinc-900',
        'dark:[&_h1_a:hover]:!text-zinc-100 dark:[&_h2_a:hover]:!text-zinc-100 dark:[&_h3_a:hover]:!text-zinc-100 dark:[&_h4_a:hover]:!text-zinc-100 dark:[&_h5_a:hover]:!text-zinc-100 dark:[&_h6_a:hover]:!text-zinc-100',
        'prose-p:leading-7 prose-li:leading-7',
        'prose-pre:my-0 prose-table:my-0',
        'prose-a:text-point-1 prose-a:font-semibold prose-a:no-underline transition-colors',
        'hover:prose-a:text-point-2 dark:prose-a:text-point-2 dark:hover:prose-a:text-point-4',
        'prose-hr:hidden',
        '[&_:not(pre)>code]:rounded-md [&_:not(pre)>code]:border [&_:not(pre)>code]:border-zinc-200',
        '[&_:not(pre)>code]:bg-zinc-100 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:text-[0.9em]',
        'dark:[&_:not(pre)>code]:border-zinc-700 dark:[&_:not(pre)>code]:bg-zinc-800',
      )}
      options={{
        forceBlock: true,
        wrapper: 'article',
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
          table: {
            component: Table,
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
