import { observer } from 'mobx-react';
import React from 'react';

type BlogSearchNavProps = {
  isNav: boolean;
};

type BlogSearchNavFC = React.FC<BlogSearchNavProps>;

const BlogSearchNav: BlogSearchNavFC = () => {
  return <div></div>;
};

export default observer(BlogSearchNav);
