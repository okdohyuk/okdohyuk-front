import React from 'react';
import { CheckSquare, Square, Trash2 } from 'lucide-react';
import { observer } from 'mobx-react';

import useStore from '@hooks/useStore';
import { Todo } from '@stores/TodoStore/type';

type ToDoCardType = {
  todo: Todo;
};

function ToDoCard({ todo }: ToDoCardType) {
  const { toggleTodoCheck, removeTodo } = useStore('todoStore');

  return (
    <div
      key={todo.id}
      className="flex items-center w-full space-x-1 overflow-hidden bg-basic-4 rounded-md p-2"
      suppressHydrationWarning
    >
      <button
        type="button"
        onClick={() => toggleTodoCheck(todo.id)}
        className="t-d-1 t-basic-1 cursor-pointer"
        aria-pressed={todo.isChecked}
      >
        {todo.isChecked ? <CheckSquare /> : <Square />}
      </button>
      <div className="flex flex-1 break-all text-left t-d-1 t-basic-1">{todo.title}</div>
      <button
        type="button"
        className="t-d-1 t-basic-1 cursor-pointer"
        onClick={() => removeTodo(todo.id)}
        aria-label="remove todo"
      >
        <Trash2 />
      </button>
    </div>
  );
}

export default observer(ToDoCard);
