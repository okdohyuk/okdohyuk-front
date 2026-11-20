import React from 'react';
import CodeCopy from './CodeCopy';
import Code from './Code';
import { highlightCode, languageFromClassName } from './highlight';
import { extractTextFromReactNode } from './utils';
import { MarkdownComponent } from './type';

type CodeElementProps = { className?: string; children?: React.ReactNode };

// markdown-to-jsx renders a fence as <pre><code class="lang-xxx">raw text</code></pre>;
// `pre` is overridden to this component, so `children` is that <code> element.
const CodeWindow: MarkdownComponent = function CodeWindow({ children, className }) {
  const codeProps: CodeElementProps = React.isValidElement<CodeElementProps>(children)
    ? children.props
    : { children };
  const code = extractTextFromReactNode(codeProps.children).replace(/\n$/, '');
  const { html, language, label } = highlightCode(code, languageFromClassName(codeProps.className));

  return (
    <CodeCopy copyString={code} label={label} className={className}>
      <Code html={html} language={language} />
    </CodeCopy>
  );
};

export default CodeWindow;
