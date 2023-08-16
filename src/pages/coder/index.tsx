import React from 'react';
import { useTranslation } from 'next-i18next';
import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { observer } from 'mobx-react';
import Opengraph from '@components/Basic/Opengraph';
import MobileScreenWarpper from '@components/Complex/Layouts/MobileScreenWarpper';
import ClassName from '@utils/classNameUtils';
import { CoderFormType, CoderType } from '@utils/coderUtils/type';
import CoderUtils from '@utils/coderUtils';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';

const coderList: CoderType[] = ['BASE64', 'URI'];

function CoderPage() {
  const { t } = useTranslation('coder');
  const { cls } = ClassName;
  const { register, handleSubmit, control } = useForm<CoderFormType>({
    defaultValues: { type: 'BASE64', count: 1, isEncoder: true, value: '' },
  });
  const [resultList, setResultList] = React.useState<string[] | null>(null);
  const { runCoder } = CoderUtils;

  const onSubmit: SubmitHandler<CoderFormType> = (data) => {
    const result = runCoder(data);
    setResultList(result);
  };

  return (
    <>
      <Opengraph
        title={t('openGraph.title')}
        ogTitle={t('openGraph.ogTitle')}
        description={t('openGraph.description')}
      />
      <MobileScreenWarpper className="dark:text-white">
        <h1 className="t-t-1 t-basic-1">{t('title')}</h1>
        <section className="flex flex-col mb-4 space-y-4">
          <Controller
            control={control}
            name={'type'}
            render={({ field: { value, onChange } }) => {
              return (
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {coderList.map((i) => (
                    <div
                      key={i}
                      className={cls(
                        't-t-3 cursor-pointer',
                        value === i ? 't-basic-1' : 't-basic-4',
                      )}
                      onClick={() => onChange(i)}
                    >
                      {i}
                    </div>
                  ))}
                </div>
              );
            }}
          />
        </section>
        <section className="flex justify-end mb-4 gap-4">
          <div className="flex items-center space-x-2">
            <label className="t-d-1">횟수</label>
            <input
              type="number"
              className="input-text w-12"
              {...register('count', {
                valueAsNumber: true,
                min: 1,
              })}
            />
          </div>
          <Controller
            control={control}
            name={'isEncoder'}
            render={({ field: { value, onChange } }) => {
              return (
                <div className="flex min-h-[32px] p-1 bg-point-3 rounded-md">
                  <button
                    className={cls(value ? 'bg-point-1' : '', 'p-1 rounded-md t-c-1 t-basic-10')}
                    onClick={() => onChange(true)}
                  >
                    Encoder
                  </button>
                  <button
                    className={cls(!value ? 'bg-point-1' : '', 'p-1 rounded-md t-c-1 t-basic-10')}
                    onClick={() => onChange(false)}
                  >
                    Decoder
                  </button>
                </div>
              );
            }}
          />
        </section>
        <section className="flex flex-col space-y-4">
          <textarea className="input-text resize-none h-32" {...register('value')} />
          <button className="button" onClick={handleSubmit(onSubmit)}>
            완성
          </button>
          <div>사이보기 + 복사</div>
          <textarea
            className="input-text resize-none h-32"
            value={resultList ? resultList[resultList.length - 1] : ''}
          />
          <button className="button">복사</button>
        </section>
      </MobileScreenWarpper>
    </>
  );
}

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale as string, ['common', 'coder'])),
  },
});

export default observer(CoderPage);
