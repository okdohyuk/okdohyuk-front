import { isValidElement, useEffect } from 'react';
import Prism from 'prismjs';
import { MarkdownComponent } from './type';

import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';

const Code: MarkdownComponent = function Code({ children }) {
  useEffect(() => {
    Prism.highlightAll();
  }, [children]);

  if (isValidElement(children)) {
    return children;
  }

  return <span>{children}</span>;
};

export default Code;
