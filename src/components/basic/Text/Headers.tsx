import * as React from 'react';
import { Text, TextProps } from './Text';

export const H1 = React.forwardRef<HTMLHeadingElement, TextProps>((props, ref) => (
  <Text asChild variant="t1" {...props} ref={ref}>
    <h1>{props.children}</h1>
  </Text>
));
H1.displayName = 'H1';

export const H2 = React.forwardRef<HTMLHeadingElement, TextProps>((props, ref) => (
  <Text asChild variant="t2" {...props} ref={ref}>
    <h2>{props.children}</h2>
  </Text>
));
H2.displayName = 'H2';

export const H3 = React.forwardRef<HTMLHeadingElement, TextProps>((props, ref) => (
  <Text asChild variant="t3" {...props} ref={ref}>
    <h3>{props.children}</h3>
  </Text>
));
H3.displayName = 'H3';
