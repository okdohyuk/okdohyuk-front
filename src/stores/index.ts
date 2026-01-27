import { enableStaticRendering } from 'mobx-react';
import TodoStore from '@stores/TodoStore';
import PercentStore from '@stores/PercentStore';
import BlogStore from '@stores/BlogStore';
import BlogSearchStore from '@stores/BlogSearchStore';
import UserStore from '@stores/UserStore';
import { Store } from '@stores/type';

enableStaticRendering(typeof window === 'undefined');

let todoStore: TodoStore;
let percentStore: PercentStore;
let blogStore: BlogStore;
let blogSearchStore: BlogSearchStore;
let userStore: UserStore;

const stores: Store = {
  get todoStore() {
    if (!todoStore) todoStore = new TodoStore();
    return todoStore;
  },
  get percentStore() {
    if (!percentStore) percentStore = new PercentStore();
    return percentStore;
  },
  get blogStore() {
    if (!blogStore) blogStore = new BlogStore();
    return blogStore;
  },
  get blogSearchStore() {
    if (!blogSearchStore) blogSearchStore = new BlogSearchStore();
    return blogSearchStore;
  },
  get userStore() {
    if (!userStore) userStore = new UserStore();
    return userStore;
  },
};

export default stores;
