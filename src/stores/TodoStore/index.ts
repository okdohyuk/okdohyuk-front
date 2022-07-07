import { observable, makeObservable, action } from 'mobx';

export interface Todo {
  id: string;
  title: string;
  isChecked: boolean;
}

export interface TodoStoreState {
  todo: Todo[];
  addTodo: (title: string) => void;
  updateTodo: (newTodo: Todo) => void;
  removeTodo: (id: string) => void;
}

class TodoStore implements TodoStoreState {
  constructor() {
    makeObservable(this);
  }

  @observable todo: Array<Todo> = [{ id: new Date().toString(), title: 'title', isChecked: false }];

  @action addTodo = (title: string) => {
    this.todo = [...this.todo, { id: new Date().toString(), title, isChecked: false }];
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

export default TodoStore;
