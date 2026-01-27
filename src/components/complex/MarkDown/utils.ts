import React from 'react';

export const extractTextFromReactNode = (node: React.ReactNode): string => {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractTextFromReactNode).join('');
  if (React.isValidElement(node)) {
    return extractTextFromReactNode((node.props as any).children);
  }
  return '';
};
