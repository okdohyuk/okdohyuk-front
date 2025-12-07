import { enableStaticRendering } from 'mobx-react';
import TodoStore from '@stores/TodoStore';
import PercentStore from '@stores/PercentStore';
import BlogStore from '@stores/BlogStore';
import BlogSearchStore from '@stores/BlogSearchStore';
import UserStore from '@stores/UserStore';

// eslint-disable-next-line react-hooks/rules-of-hooks
enableStaticRendering(typeof window === 'undefined');

const stores = {
  todoStore: new TodoStore(),
  percentStore: new PercentStore(),
  blogStore: new BlogStore(),
  blogSearchStore: new BlogSearchStore(),
  userStore: new UserStore(),
};

export default stores;
