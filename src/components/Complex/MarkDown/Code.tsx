import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import { MarkdownComponent } from './type';

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
