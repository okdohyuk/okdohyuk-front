import React, { useEffect } from 'react';
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

const Code: MarkdownComponent = ({ children }) => {
  useEffect(() => {
    const highlight = async () => {
      await Prism.highlightAll(); // <--- prepare Prism
    };
    highlight(); // <--- call the async function
  }, [children]); // <--- run when post updates

  return <>{children}</>;
};

export default Code;
