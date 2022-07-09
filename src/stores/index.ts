import { enableStaticRendering } from 'mobx-react';
import TodoStore from '@stores/TodoStore';
import PercentStore from '@stores/PercentStore';

// eslint-disable-next-line react-hooks/rules-of-hooks
enableStaticRendering(typeof window === 'undefined');

export default {
  todoStore: new TodoStore(),
  percentStore: new PercentStore(),
};
