'use client';

import React, { useState, useCallback } from 'react';
import { observer } from 'mobx-react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { MdMoreHoriz, MdOutlineContentCopy, MdOutlineCheck } from 'react-icons/md';
import { debounce } from 'lodash';

import CodeCopy from '@components/complex/MarkDown/CodeCopy';
import { cls } from '@utils/classNameUtils';
import CoderUtils from '@utils/coderUtils';
import { CoderFormType, CoderType } from '@utils/coderUtils/type';
import { useTranslation } from '~/app/i18n/client';
import { LanguageParams } from '~/app/[lng]/layout';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@components/ui/select';

const coderList: CoderType[] = [
  'BASE64',
  'URI',
  'URI_COMPONENT',
  'ESCAPE',
  'HEX',
  'BINARY',
  'HTML',
];

function CoderPage({ params }: LanguageParams) {
  const { lng } = React.use(params);
  const { t } = useTranslation(lng, 'coder');
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
    <div className="space-y-6">
      <h1 className="t-t-1 t-basic-1">{t('title')}</h1>
      <section className="space-y-4 bg-basic-7 p-4 rounded-lg shadow">
        <Controller
          control={control}
          name={'type'}
          render={({ field: { value, onChange } }) => (
            <div className="flex flex-col space-y-2">
              <Select value={value} onValueChange={(v) => onChange(v as CoderType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {coderList.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="t-d-2">{t(`desc.${value}`)}</p>
            </div>
          )}
        />
        <div className="flex justify-end flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <label className="t-d-1">{t('count')}</label>
            <input
              type="number"
              className={cls('input-text w-16', errors.count ? 'outline' : '')}
              {...register('count', {
                valueAsNumber: true,
                min: 1,
              })}
            />
          </div>
          <Controller
            control={control}
            name={'isEncoder'}
            render={({ field: { value, onChange } }) => (
              <div className="flex min-h-[32px] p-1 bg-point-3 rounded-md">
                <button
                  className={cls(value ? 'bg-point-1' : '', 'px-3 rounded-md text-white t-basic-10')}
                  onClick={() => onChange(true)}
                >
                  {t('encoder')}
                </button>
                <button
                  className={cls(
                    !value ? 'bg-point-1' : '',
                    'px-3 rounded-md text-white t-basic-10',
                  )}
                  onClick={() => onChange(false)}
                >
                  {t('decoder')}
                </button>
              </div>
            )}
          />
        </div>

        <textarea className="input-text resize-none h-32" {...register('value')} />
        <button className="button w-full" onClick={handleSubmit(onSubmit)}>
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
        ) : null}
        <textarea
          className="input-text resize-none h-32"
          value={resultList ? resultList[resultList.length - 1] : ''}
          readOnly
        />
        <button className="button w-full gap-2" onClick={copyToClipboard}>
          <MdOutlineContentCopy className={cls(copied ? 'hidden' : '')} />
          <MdOutlineCheck className={cls(!copied ? 'hidden' : '')} />
          {t('copy')}
        </button>
      </section>
    </div>
  );
}

export default observer(CoderPage);
