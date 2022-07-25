import React from 'react';
import { inject, observer } from 'mobx-react';
import { TodoStoreState } from '~/stores/TodoStore';
import useInput from '@hooks/useInput';
import { MdCheckBoxOutlineBlank, MdCheckBox, MdDeleteForever } from 'react-icons/md';
import Opengraph from '@components/opengraph';

type TodoApp = {
  todoStore: TodoStoreState;
};

const TodoApp = inject('todoStore')(
  observer(({ todoStore }: TodoApp) => {
    const { todos, addTodo, toggleTodoCheck, removeTodo } = todoStore;

    const { onChange, value, reset } = useInput('');

    const handleSubmitTodo = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!value) return;

      addTodo(value);
      reset();
    };

    return (
      <div className={'w-full min-h-screen dark:bg-black pb-[70px] lg:pb-auto'}>
        <Opengraph
          title={'todo app'}
          ogTitle={'투두앱'}
          description={'투두앱으로 자신의 할 일을 관리해보세요'}
        />
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
                'flex min-w-full md:min-w-[300px] lg:min-w-[400px] placeholder-black py-1 px-1.5 bg-rose-500 rounded rounded-2xl border border-gray-800 focus:border-black focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:outline-none'
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
                  'w-full md:max-w-lg lg:max-w-3xl lg:min-w-[400px] flex space-x-1 overflow-hidden bg-zinc-300 dark:bg-zinc-800 rounded px-1.5 py-2 shadow-xl dark:shadow-lg items-center'
                }
              >
                <div onClick={() => toggleTodoCheck(todo.id)}>
                  {todo.isChecked ? (
                    <MdCheckBox
                      className={'text-lg md:text-xl lg:text-2xl dark:text-white cursor-pointer'}
                    />
                  ) : (
                    <MdCheckBoxOutlineBlank
                      className={'text-lg md:text-xl lg:text-2xl dark:text-white cursor-pointer'}
                    />
                  )}
                </div>
                <div
                  className={
                    'text-lg md:text-xl lg:text-2xl flex flex-1 dark:text-white break-all text-left'
                  }
                >
                  {todo.title}
                </div>
                <MdDeleteForever
                  className={'text-lg md:text-xl lg:text-2xl dark:text-white cursor-pointer'}
                  onClick={() => removeTodo(todo.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }),
);

export default TodoApp;
