import { enableStaticRendering } from 'mobx-react';
import TodoStore from '@stores/TodoStore';
import PercentStore from '@stores/PercentStore';
import BlogStore from '@stores/BlogStore';
import UserStore from '@stores/UserStore';

// eslint-disable-next-line react-hooks/rules-of-hooks
enableStaticRendering(typeof window === 'undefined');

export default {
  todoStore: new TodoStore(),
  percentStore: new PercentStore(),
  blogStore: new BlogStore(),
  userStore: new UserStore(),
};
