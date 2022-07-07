import React from 'react';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { TodoStoreState } from '~/stores/TodoStore';

type TodoApp = {
  todo: TodoStoreState;
};

const TodoApp = inject('todoStore')(
  observer(({ todo }: TodoApp) => {
    console.log('=>(index.tsx:8) props', toJS(todo));

    return <div onClick={() => todo.addTodo('wefwe')}>h</div>;
  }),
);

export default TodoApp;
