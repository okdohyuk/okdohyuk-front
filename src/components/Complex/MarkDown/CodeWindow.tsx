import React, { useMemo } from 'react';
import CodeCopy from './CodeCopy';
import { MarkdownComponent } from './type';
import Code from './Code';

const CodeWindow: MarkdownComponent = ({ children, ...props }) => {
  const copyString = useMemo(() => {
    if (React.isValidElement(children)) return children.props.children;
    return '';
  }, [children]);

  return (
    <CodeCopy {...props} copyString={copyString}>
      <Code {...props}>{children}</Code>
    </CodeCopy>
  );
};

export default CodeWindow;