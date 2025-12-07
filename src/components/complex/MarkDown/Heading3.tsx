import React from 'react';
import Link from '~/components/basic/Link';
import StringUtils from '@utils/stringUtils';
import { MarkdownComponent } from './type';

const Heading3: MarkdownComponent = function Heading3({ children }) {
  const urlSlug = StringUtils.toUrlSlug(`${children}`);

  return (
    <h3 id={urlSlug}>
      <Link href={`#${urlSlug}`} className="no-underline hover:underline">
        {children}
      </Link>
    </h3>
  );
};

export default Heading3;
