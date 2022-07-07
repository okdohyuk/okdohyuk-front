import { observable, makeObservable, action, reaction } from 'mobx';
import Cookies from 'js-cookie';

export interface Todo {
  id: string;
  title: string;
  isChecked: boolean;
}

export interface TodoStoreState {
  todos: Todo[];
  addTodo: (title: string) => void;
  toggleTodoCheck: (id: string) => void;
  updateTodo: (newTodo: Todo) => void;
  removeTodo: (id: string) => void;
}

class TodoStore implements TodoStoreState {
  @observable public todos: Array<Todo> = [];

  constructor() {
    makeObservable(this);

    reaction(
      () => this.todos.map((todo) => todo.isChecked),
      () => {
        Cookies.set('TODO-LIST', JSON.stringify(this.todos));
      },
    );

    const getTodo = Cookies.get('TODO-LIST');

    if (getTodo !== undefined) {
      this.todos = JSON.parse(getTodo);
    }
  }

  @action public addTodo = (title: string) => {
    this.todos = [...this.todos, { id: new Date().getTime().toString(), title, isChecked: false }];
  };

  @action public toggleTodoCheck = (id: string) => {
    const idx = this.todos.findIndex((todo) => todo.id === id);
    const tempTodo = this.todos;
    tempTodo[idx].isChecked = !tempTodo[idx].isChecked;
    this.todos = tempTodo;
  };

  @action public updateTodo = (newTodo: Todo) => {
    const idx = this.todos.findIndex((todo) => todo.id === newTodo.id);
    const tempTodo = this.todos;
    tempTodo[idx] = newTodo;
    this.todos = tempTodo;
  };

  @action public removeTodo = (id: string) => {
    this.todos = this.todos.filter((todo) => todo.id !== id);
  };
}

export default TodoStore;
