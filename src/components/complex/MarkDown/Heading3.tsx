import React from 'react';
import { MarkdownComponent } from './type';
import StringUtils from '@utils/stringUtils';
import Link from '~/components/basic/Link';

const Heading3: MarkdownComponent = ({ children }) => {
  const urlSlug = StringUtils.toUrlSlug(children + '');

  return (
    <h3 id={urlSlug}>
      <Link href={'#' + urlSlug} className="no-underline hover:underline">
        {children}
      </Link>
    </h3>
  );
};

export default Heading3;
