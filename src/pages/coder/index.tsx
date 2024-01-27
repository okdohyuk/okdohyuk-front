import React, { useState, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { observer } from 'mobx-react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { MdMoreHoriz, MdOutlineContentCopy, MdOutlineCheck } from 'react-icons/md';
import { debounce } from 'lodash';

import Opengraph from '~/components/basic/Opengraph';
import MobileScreenWrapper from '@components/complex/Layout/MobileScreenWrapper';
import CodeCopy from '@components/complex/MarkDown/CodeCopy';
import ClassName from '@utils/classNameUtils';
import CoderUtils from '@utils/coderUtils';
import { CoderFormType, CoderType } from '@utils/coderUtils/type';

const coderList: CoderType[] = ['BASE64', 'URI'];

function CoderPage() {
  const { t } = useTranslation('coder');
  const { cls } = ClassName;
  const [copied, setCopied] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CoderFormType>({
    defaultValues: { type: 'BASE64', count: 1, isEncoder: true, value: '' },
  });
  const [resultList, setResultList] = useState<string[] | null>(null);
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
  const { runCoder } = CoderUtils;

  const onSubmit: SubmitHandler<CoderFormType> = (data) => {
    const result = runCoder(data);
    setResultList(result);
    setIsMoreOpen(false);
  };

  const setServicesValueDebounced = useCallback(
    debounce(() => setCopied(false), 1000),
    [],
  );

  const copyToClipboard = () => {
    if (!resultList) return;
    navigator.clipboard.writeText(resultList[resultList.length - 1]);

    setCopied(true);
    setServicesValueDebounced();
  };

  return (
    <>
      <Opengraph
        title={t('openGraph.title')}
        ogTitle={t('openGraph.ogTitle')}
        description={t('openGraph.description')}
        keywords={t('openGraph.keywords', { returnObjects: true })}
        isAds
      />
      <MobileScreenWrapper className="dark:text-white">
        <h1 className="t-t-1 t-basic-1 mb-4">{t('title')}</h1>
        <section className="flex flex-col space-y-4">
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
        <section className="flex justify-end flex-wrap mb-4 gap-x-4 gap-y-2">
          <div className="flex items-center space-x-2">
            <label className="t-d-1">{t('count')}</label>
            <input
              type="number"
              className={cls('input-text w-12', errors.count ? 'outline' : '')}
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
                    className={cls(
                      value ? 'bg-point-1' : '',
                      'p-1 rounded-md text-white t-basic-10',
                    )}
                    onClick={() => onChange(true)}
                  >
                    {t('encoder')}
                  </button>
                  <button
                    className={cls(
                      !value ? 'bg-point-1' : '',
                      'p-1 rounded-md text-white t-basic-10',
                    )}
                    onClick={() => onChange(false)}
                  >
                    {t('decoder')}
                  </button>
                </div>
              );
            }}
          />
        </section>
        <section className="flex flex-col space-y-4">
          <textarea className="input-text resize-none h-32" {...register('value')} />
          <button className="button" onClick={handleSubmit(onSubmit)}>
            {t('submit')}
          </button>

          {resultList !== null && resultList.length > 1 ? (
            !isMoreOpen ? (
              <button className="button w-16 h-4 mx-auto" onClick={() => setIsMoreOpen(true)}>
                <MdMoreHoriz className="text-white" />
              </button>
            ) : (
              resultList.slice(0, -1).map((value) => (
                <CodeCopy key={value} className="bg-basic-4" copyString={value}>
                  {value}
                </CodeCopy>
              ))
            )
          ) : (
            <></>
          )}
          <textarea
            className="input-text resize-none h-32"
            value={resultList ? resultList[resultList.length - 1] : ''}
          />
          <button className="button gap-2" onClick={copyToClipboard}>
            <MdOutlineContentCopy className={cls(copied ? 'hidden' : '')} />
            <MdOutlineCheck className={cls(!copied ? 'hidden' : '')} />
            {t('copy')}
          </button>
        </section>
      </MobileScreenWrapper>
    </>
  );
}

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale as string, ['common', 'coder'])),
  },
});

export default observer(CoderPage);
