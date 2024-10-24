import React from 'react';
import dynamic from 'next/dynamic';
import { inject, observer } from 'mobx-react';
import useInput from '@hooks/useInput';
import { TodoStoreState } from '@stores/TodoStore/type';
import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Opengraph from 'components/legacy/basic/Opengraph';
import MobileScreenWrapper from '@components/complex/Layout/MobileScreenWrapper';

const ToDoCard = dynamic(() => import('@components/todo/ToDoCard'), { ssr: false });

type TodoAppComponent = ({ todoStore }: { todoStore: TodoStoreState }) => JSX.Element;

const TodoApp: TodoAppComponent = ({ todoStore }) => {
  const { todos, addTodo } = todoStore;
  const { t } = useTranslation('todo');
  const { onChange, value, reset } = useInput('');

  const handleSubmitTodo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value) return;

    addTodo(value);
    reset();
  };

  return (
    <>
      <Opengraph
        title={t('openGraph.title')}
        ogTitle={t('openGraph.ogTitle')}
        description={t('openGraph.description')}
      />
      <MobileScreenWrapper>
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
          {todos.length ? todos.map((todo) => <ToDoCard key={todo.id} todo={todo} />) : null}
        </div>
      </MobileScreenWrapper>
    </>
  );
};

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale ? locale : '', ['common', 'todo'])),
  },
});

export default inject('todoStore')(observer(TodoApp));
