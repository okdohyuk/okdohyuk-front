import React from 'react';
import { MdCheckBoxOutlineBlank, MdCheckBox, MdDeleteForever } from 'react-icons/md';
import { observer } from 'mobx-react';

import useStore from '@hooks/useStore';
import TodoStore from '@stores/TodoStore';
import { Todo } from '@stores/TodoStore/type';

type ToDoCardType = {
  todo: Todo;
};

function ToDoCard({ todo }: ToDoCardType) {
  const { toggleTodoCheck, removeTodo } = useStore<TodoStore>('todoStore');

  return (
    <div
      key={todo.id}
      className={'flex items-center w-full space-x-1 overflow-hidden bg-basic-4 rounded-md p-2'}
      suppressHydrationWarning
    >
      <div onClick={() => toggleTodoCheck(todo.id)}>
        {todo.isChecked ? (
          <MdCheckBox className={'t-d-1 t-basic-1 cursor-pointer'} />
        ) : (
          <MdCheckBoxOutlineBlank className={'t-d-1 t-basic-1 cursor-pointer'} />
        )}
      </div>
      <div className={'flex flex-1 break-all text-left t-d-1 t-basic-1'}>{todo.title}</div>
      <MdDeleteForever
        className={'t-d-1 t-basic-1 cursor-pointer'}
        onClick={() => removeTodo(todo.id)}
      />
    </div>
  );
}

export default observer(ToDoCard);
