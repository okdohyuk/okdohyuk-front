import React from 'react';
import { MarkdownComponent } from './type';

const Table: MarkdownComponent = ({ children, ...props }) => {
  return (
    <div className={'flex overflow-x-scroll my-4'}>
      <table {...props} className={'table table-auto m-0 break-keep'}>
        {children}
      </table>
    </div>
  );
};

export default Table;
