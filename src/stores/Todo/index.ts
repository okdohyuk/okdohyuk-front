import { observable, makeObservable, action } from 'mobx';

interface Index {
  id: string;
  title: string;
  isChecked: boolean;
}

class Todo {
  constructor() {
    makeObservable(this);
  }

  @observable todo: Array<Index> = [
    { id: new Date().toString(), title: 'title', isChecked: false },
  ];

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

export default new Todo();
