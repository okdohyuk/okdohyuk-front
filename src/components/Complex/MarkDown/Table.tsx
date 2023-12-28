import React from 'react';
import { MarkdownComponent } from './type';

const Table: MarkdownComponent = ({ children, ...props }) => {
  return (
    <div className={'flex overflow-x-scroll my-4'}>
      <table {...props} className={'table table-fixed m-0 w-auto'}>
        {children}
      </table>
    </div>
  );
};

export default Table;
