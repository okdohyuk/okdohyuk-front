import { useMemo } from 'react';
import { observable, makeObservable, action } from 'mobx';
import { enableStaticRendering } from 'mobx-react';
import Todo from './Todo';

// eslint-disable-next-line react-hooks/rules-of-hooks
enableStaticRendering(typeof window === 'undefined');

/*interface Todo {
  id: string;
  title: string;
  isChecked: boolean;
}

let store;

class Store {
  constructor() {
    makeObservable(this);
  }

  @observable todo: Array<Todo> = [{ id: new Date().toString(), title: 'title', isChecked: false }];

  @action addTodo = (title: string) => {
    this.todo = [...this.todo, { id: new Date().toString(), title: title, isChecked: false }];
  };

  @action updateTodo = (newTodo: Todo) => {
    const idx = this.todo.findIndex((todo) => todo.id === newTodo.id);
    const tempTodo = this.todo;
    tempTodo[idx] = newTodo;
    this.todo = tempTodo;
  };

  @action removeTodo = (id: string) => {
    this.todo = this.todo.filter((todo) => todo.id !== id);
  };
}

function initializeStore(initialData = null) {
  const newStore = store ?? new Store();

  if (initialData) {
    newStore.hydrate(initialData);
  }

  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') return newStore;
  // Create the store once in the client
  if (!store) store = newStore;

  return newStore;
}

export function useStore(initialState: any) {
  const store = useMemo(() => initializeStore(initialState), [initialState]);
  return store;
}*/

export default {
  Todo,
};
