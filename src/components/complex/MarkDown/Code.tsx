import React from 'react';

type CodeProps = {
  /** Already-safe HTML from highlightCode (Prism tokens or escaped text). */
  html: string;
  language: string;
};

// `data-language` instead of a `language-xxx` class keeps Prism's selector-based
// highlightAll (and any plugin) away from markup React owns.
function Code({ html, language }: CodeProps) {
  return (
    <code
      data-language={language}
      // eslint-disable-next-line react/no-danger -- html is produced by Prism.highlight / escapeHtml
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default Code;
