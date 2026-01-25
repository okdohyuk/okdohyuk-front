'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { observer } from 'mobx-react';
import useInput from '@hooks/useInput';
import { useTranslation } from '~/app/i18n/client';
import useIsClient from '@hooks/useIsClient';
import useStore from '@hooks/useStore';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';
import { H1 } from '@components/basic/Text';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';

const ToDoCard = dynamic(() => import('~/app/[lng]/(mobile)/todo/components/ToDoCard'), {
  ssr: false,
});

function TodoPage({ params }: LanguageParams) {
  const { lng } = React.use(params);
  const language = lng as Language;
  const { todos, addTodo } = useStore('todoStore');
  const { t } = useTranslation(language, 'todo');
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
      <H1 className="mb-4 t-basic-1">{t('title')}</H1>
      <form onSubmit={handleSubmitTodo} className="mb-4 flex items-center gap-2">
        <Input
          className="w-full"
          placeholder={t('inputPlaceholder')}
          value={value}
          onChange={onChange}
        />
        <Button type="submit" className="w-20">
          {t('add')}
        </Button>
      </form>

      <div className="flex flex-col space-y-2">
        {isClient && todos.length
          ? todos.map((todo) => <ToDoCard key={todo.id} todo={todo} />)
          : null}
      </div>
    </>
  );
}

export default observer(TodoPage);
