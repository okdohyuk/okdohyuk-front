import { observable, makeObservable, action, reaction } from 'mobx';
import Cookies from 'js-cookie';
import { Todo, TodoStoreState } from '@stores/TodoStore/type';

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
