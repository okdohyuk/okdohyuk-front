import React from 'react';
import { MarkdownComponent } from './type';
import StringUtils from '@utils/stringUtils';
import Link from '~/components/basic/Link';

const Heading2: MarkdownComponent = ({ children }) => {
  const urlSlug = StringUtils.toUrlSlug(children + '');

  return (
    <h2 id={urlSlug}>
      <Link href={'#' + urlSlug} className="no-underline hover:underline">
        {children}
      </Link>
    </h2>
  );
};

export default Heading2;
