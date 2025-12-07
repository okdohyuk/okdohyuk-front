import React from 'react';
import Link from '~/components/basic/Link';
import StringUtils from '@utils/stringUtils';
import { MarkdownComponent } from './type';

const Heading2: MarkdownComponent = function Heading2({ children }) {
  const urlSlug = StringUtils.toUrlSlug(`${children}`);

  return (
    <h2 id={urlSlug}>
      <Link href={`#${urlSlug}`} className="no-underline hover:underline">
        {children}
      </Link>
    </h2>
  );
};

export default Heading2;
