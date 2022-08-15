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
