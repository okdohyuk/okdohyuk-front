import React from 'react';
import { inject, observer } from 'mobx-react';
import { TodoStoreState } from '~/stores/TodoStore';
import useInput from '@hooks/useInput';
import { MdCheckBoxOutlineBlank, MdCheckBox, MdDeleteForever } from 'react-icons/md';

type TodoApp = {
  todoStore: TodoStoreState;
};

const TodoApp = inject('todoStore')(
  observer(({ todoStore }: TodoApp) => {
    const { todos, addTodo, toggleTodoCheck, removeTodo } = todoStore;

    const { onChange, value, reset } = useInput('');

    const handleSubmitTodo = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      addTodo(value);
      reset();
    };

    return (
      <div className={'w-full min-h-screen dark:bg-black'}>
        <div className="flex flex-col items-center gap-6 text-center px-4 py-12 lg:py-24">
          <h1
            className={
              'font-bold text-2xl max-w-md md:text-3xl lg:text-5xl lg:max-w-2xl dark:text-white'
            }
          >
            {'Todos'}
          </h1>
          <form onSubmit={handleSubmitTodo}>
            <input
              className={
                'w-xl py-1 px-1.5 bg-gray-200 rounded rounded-2xl border border-gray-800 focus:border-black'
              }
              placeholder={'typing new todo'}
              value={value}
              onChange={onChange}
            />
          </form>
          <div className={'flex flex-col space-y-2.5'}>
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={
                  'max-w-full flex space-x-1 bg-zinc-300 dark:bg-zinc-800 rounded px-1.5 py-2 shadow-xl dark:shadow-lg'
                }
              >
                <div onClick={() => toggleTodoCheck(todo.id)}>
                  {todo.isChecked ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
                </div>
                <div className={'flex flex-1'}>{todo.title}</div>
                <MdDeleteForever onClick={() => removeTodo(todo.id)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }),
);

export default TodoApp;
