import React from 'react';
import { MarkdownComponent } from './type';
import StringUtils from '@utils/stringUtils';

const Heading2: MarkdownComponent = ({ children }) => (
  <h2 id={StringUtils.toUrlSlug(children + '')}>{children}</h2>
);

export default Heading2;
