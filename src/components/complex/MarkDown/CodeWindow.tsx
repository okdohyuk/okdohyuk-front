import React, { useMemo, useRef } from 'react';
import CodeCopy from './CodeCopy';
import Code from './Code';
import { MarkdownComponent } from './type';

const CodeWindow: MarkdownComponent = function CodeWindow({ children: codeDom, ...props }) {
  const prevCodeDom = useRef<React.ReactNode>(codeDom);
  const prevCopyString = useRef('');

  const copyString = useMemo(() => {
    if (React.isValidElement(codeDom)) {
      const copyValue = codeDom.props.children as string;
      prevCopyString.current = copyValue;
      return copyValue;
    }

    return prevCopyString.current;
  }, [codeDom]);

  const memoizedCodeDom = useMemo(() => {
    if (prevCopyString.current === copyString) {
      return prevCodeDom.current;
    }
    prevCodeDom.current = codeDom;
    return codeDom;
  }, [codeDom, copyString]);

  return (
    <CodeCopy {...props} copyString={copyString}>
      <Code {...props}>{memoizedCodeDom}</Code>
    </CodeCopy>
  );
};

export default CodeWindow;
