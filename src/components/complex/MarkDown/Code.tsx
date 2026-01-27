import { isValidElement, useEffect } from 'react';
import { MarkdownComponent } from './type';

const Code: MarkdownComponent = function Code({ children }) {
  useEffect(() => {
    const highlight = async () => {
      const Prism = (await import('prismjs')).default;
      await Promise.all([
        import('prismjs/components/prism-typescript'),
        import('prismjs/components/prism-javascript'),
        import('prismjs/components/prism-jsx'),
        import('prismjs/components/prism-tsx'),
        import('prismjs/components/prism-json'),
        import('prismjs/components/prism-java'),
        import('prismjs/components/prism-docker'),
        import('prismjs/components/prism-sql'),
        import('prismjs/components/prism-bash'),
      ]);
      Prism.highlightAll();
    };
    highlight();
  }, [children]);

  if (isValidElement(children)) {
    return children;
  }

  return <span>{children}</span>;
};

export default Code;
