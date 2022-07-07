import { enableStaticRendering } from 'mobx-react';
import TodoStore from './TodoStore';

// eslint-disable-next-line react-hooks/rules-of-hooks
enableStaticRendering(typeof window === 'undefined');

export default {
  TodoStore,
};
