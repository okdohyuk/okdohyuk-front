import React from 'react';
import Link from '~/components/basic/Link';
import StringUtils from '@utils/stringUtils';
import { cn } from '@utils/cn';
import { extractTextFromReactNode } from './utils';
import { MarkdownComponent } from './type';

const Heading3: MarkdownComponent = function Heading3({ children }) {
  const urlSlug = StringUtils.toUrlSlug(extractTextFromReactNode(children));

  return (
    <h3
      id={urlSlug}
      className={cn('group mt-8 text-xl font-extrabold text-zinc-900 dark:text-zinc-100')}
    >
      <Link
        href={`#${urlSlug}`}
        className="relative inline-block no-underline !text-zinc-900 hover:!text-zinc-900 dark:!text-zinc-100 dark:hover:!text-zinc-100"
      >
        <span className="pointer-events-none absolute -left-5 top-1/2 hidden -translate-y-1/2 text-point-1 opacity-0 transition-opacity md:block md:group-hover:opacity-100">
          #
        </span>
        {children}
      </Link>
    </h3>
  );
};

export default Heading3;
