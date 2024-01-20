import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import MobileScreenWrapper from '@components/complex/Layout/MobileScreenWrapper';
import { UseCategoryProps } from '@hooks/blog/type';
import useBlogCategory from '@hooks/blog/useBlogCategory';
import { blogApi } from '@api';
import { BlogCategory } from '@api/Blog';
import { cls } from '@utils/classNameUtils';

type CategoryInput = {
  nowEdit: boolean;
} & UseCategoryProps;

const CategorySettingPage = () => {
  const { register, handleSubmit, setValue, getValues, watch, reset } = useForm<CategoryInput>({
    defaultValues: { category: '', parent: null },
  });
  const nowEdit = watch('nowEdit');
  const selectedParent = watch('parent');
  const { data, refetch } = useQuery({
    queryKey: ['category'],
    queryFn: blogApi.getBlogCategory,
    enabled: false,
  });
  const { post, patch, remove } = useBlogCategory();

  useEffect(() => {
    refetch();
  }, []);

  const postCategory = useCallback(
    handleSubmit(async (data: CategoryInput) => {
      await post(data);
      reset();
      refetch();
    }),
    [refetch, reset],
  );

  const patchCategory = useCallback(
    handleSubmit(async (data: CategoryInput) => {
      await patch(data);
      reset();
      refetch();
    }),
    [refetch, reset],
  );

  const deleteCategory = useCallback(
    handleSubmit(async (data: CategoryInput) => {
      await remove(data);
      reset();
      refetch();
    }),
    [refetch, reset],
  );

  const toggleParent = useCallback(
    (data: BlogCategory) => {
      if (getValues('parent')?.id === data.id) {
        setValue('parent', null);
      } else {
        setValue('parent', data);
      }
    },
    [getValues, setValue],
  );

  const categoryRender = (data: BlogCategory) => {
    const selected = selectedParent?.id === data.id;

    return (
      <div className="p-2 bg-basic-3 rounded" key={data.id}>
        <div className="flex justify-between">
          {selected && nowEdit ? (
            <>
              <input className="input-text" id="parent" {...register('parent.name', {})} />
              <div className="flex space-x-2">
                <button className="button" onClick={patchCategory}>
                  수정
                </button>
                <button className="button bg-red-400" onClick={() => setValue('nowEdit', false)}>
                  취소
                </button>
              </div>
            </>
          ) : (
            <div
              className={cls(
                'w-fit p-1 rounded cursor-pointer t-d-1 t-basic-2',
                selected ? 'bg-point-3 text-black' : 'hover:bg-basic-4',
              )}
              onClick={() => toggleParent(data)}
            >
              {data.name}
            </div>
          )}
          {selected && !nowEdit ? (
            <div className="flex space-x-2">
              <button className="button bg-blue-400" onClick={() => setValue('nowEdit', true)}>
                수정
              </button>
              <button className="button bg-red-400" onClick={deleteCategory}>
                삭제
              </button>
            </div>
          ) : null}
        </div>

        <div className="ml-4">{data.child?.map(categoryRender)}</div>
      </div>
    );
  };

  return (
    <>
      <MobileScreenWrapper>
        <div className="flex flex-col p-4 bg-basic-1 rounded mb-4 gap-2">
          {data ? data.data.map(categoryRender) : null}
        </div>

        <div className="space-y-2">
          <input
            className="input-text"
            id="category"
            placeholder={''}
            {...register('category', {})}
          />
          <button className="button" onClick={postCategory}>
            추가
          </button>
        </div>
      </MobileScreenWrapper>
    </>
  );
};

export default CategorySettingPage;
