'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { observer } from 'mobx-react';
import useInput from '@hooks/useInput';
import { useTranslation } from '~/app/i18n/client';
import useIsClient from '@hooks/useIsClient';
import useStore from '@hooks/useStore';
import { LanguageParams } from '~/app/[lng]/layout';

const ToDoCard = dynamic(() => import('@components/todo/ToDoCard'), { ssr: false });

function TodoPage({ params: { lng } }: LanguageParams) {
  const { todos, addTodo } = useStore('todoStore');
  const { t } = useTranslation(lng, 'todo');
  const { onChange, value, reset } = useInput('');
  const isClient = useIsClient();

  const handleSubmitTodo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value) return;

    addTodo(value);
    reset();
  };

  return (
    <>
      <h1 className={'t-t-1 t-basic-1 mb-4'}>{t('title')}</h1>
      <form onSubmit={handleSubmitTodo} className="flex items-center gap-2 mb-4">
        <input
          className={'input-text w-full'}
          placeholder={t('inputPlaceholder')}
          value={value}
          onChange={onChange}
        />
        <button type="submit" className="button w-20">
          {t('add')}
        </button>
      </form>

      <div className={'flex flex-col space-y-2'}>
        {isClient && todos.length
          ? todos.map((todo) => <ToDoCard key={todo.id} todo={todo} />)
          : null}
      </div>
    </>
  );
}

export default observer(TodoPage);
