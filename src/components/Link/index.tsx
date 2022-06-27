import React from 'react';
import NextLink from 'next/link';
import PropTypes from 'prop-types';

type LinkType = {
  children: React.ReactNode;
  href: string;
  hasTargetBlank?: boolean;
  [key: string]: any;
};

export default function Link({ children, href, hasTargetBlank, ...rest }: LinkType): any {
  if (!href) return children;
  return (
    <NextLink href={href} {...rest}>
      <a onClick={(e) => e.stopPropagation()} target={hasTargetBlank ? '_blank' : '_self'}>
        {children}
      </a>
    </NextLink>
  );
}
