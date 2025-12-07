import React from 'react';
import { MarkdownComponent } from './type';

const Table: MarkdownComponent = function Table({ children, ...props }) {
  return (
    <div className="overflow-x-auto">
      <table {...props} className="min-w-full border border-basic-3">
        {children}
      </table>
    </div>
  );
};

export default Table;
