import React from 'react';
import NextLink from 'next/link';

type LinkType = {
  children: React.ReactNode;
  href: string;
  hasTargetBlank?: boolean;
  className?: string;
  [key: string]: any;
};

export default function Link({ children, href, hasTargetBlank, className, ...rest }: LinkType) {
  if (!href) return <>{children}</>;
  return (
    <NextLink href={href} {...rest}>
      <a
        onClick={(e) => e.stopPropagation()}
        target={hasTargetBlank ? '_blank' : '_self'}
        className={className}
      >
        {children}
      </a>
    </NextLink>
  );
}
