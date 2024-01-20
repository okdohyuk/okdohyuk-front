import React from 'react';
import MarkdownTransJSX from 'markdown-to-jsx';
import Aside from './Aside';
import CodeWindow from './CodeWindow';
import { MarkDownProps } from './type';
import Table from './Table';
import Link from '~/components/basic/Link';

const MarkDown: MarkDownProps = ({ contents }) => {
  return (
    <MarkdownTransJSX
      className="prose prose-zinc dark:prose-invert mt-8 mb-16 max-w-full"
      options={{
        forceBlock: true,
        wrapper: 'article',
        overrides: {
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
        },
      }}
    >
      {contents}
    </MarkdownTransJSX>
  );
};
export default MarkDown;