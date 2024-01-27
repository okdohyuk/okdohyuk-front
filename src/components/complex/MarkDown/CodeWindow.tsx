import React, { useMemo, useRef } from 'react';
import CodeCopy from './CodeCopy';
import { MarkdownComponent } from './type';
import Code from './Code';

const CodeWindow: MarkdownComponent = ({ children: codeDOM, ...props }) => {
  const prevCopyString = useRef<string>('');
  const prevCodeDOM = useRef<React.ReactNode>(codeDOM);

  const copyString = useMemo(() => {
    if (React.isValidElement(codeDOM)) return codeDOM.props.children;
    prevCopyString.current = copyString;
    return '';
  }, [codeDOM]);

  const momoCodeDOM = useMemo(() => {
    if (prevCopyString.current === copyString) return prevCodeDOM.current;
    prevCodeDOM.current = codeDOM;
    return codeDOM;
  }, [copyString]);

  return (
    <CodeCopy {...props} copyString={copyString}>
      <Code {...props}>{momoCodeDOM}</Code>
    </CodeCopy>
  );
};

export default CodeWindow;
