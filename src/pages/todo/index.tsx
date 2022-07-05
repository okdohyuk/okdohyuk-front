import React from 'react';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';

const TodoApp = inject('Todo')(
  observer(({ Todo }) => {
    console.log('=>(index.tsx:8) props', toJS(Todo));

    return <div onClick={() => Todo.addTodo('wefwe')}>h</div>;
  }),
);

export default TodoApp;
