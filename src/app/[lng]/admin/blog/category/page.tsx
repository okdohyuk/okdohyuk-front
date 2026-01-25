'use client';

import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import MobileScreenWrapper from '@components/complex/Layout/MobileScreenWrapper';
import { UseCategoryProps } from '@hooks/blog/type';
import useBlogCategory from '@hooks/blog/useBlogCategory';
import { blogApi } from '@api';
import { BlogCategory } from '@api/Blog';
import { cn } from '@utils/cn';

type CategoryInput = {
  nowEdit: boolean;
} & UseCategoryProps;

export default function CategorySettingPage() {
  const { register, handleSubmit, setValue, getValues, watch, reset } = useForm<CategoryInput>({
    defaultValues: { category: '', parent: null },
  });
  const nowEdit = watch('nowEdit');
  const selectedParent = watch('parent');
  const { data: categoryResponse, refetch } = useQuery({
    queryKey: ['category'],
    queryFn: () => blogApi.getBlogCategory(),
    enabled: false,
  });
  const { post, patch, remove } = useBlogCategory();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const postCategory = handleSubmit(async (formValues: CategoryInput) => {
    await post(formValues);
    reset();
    refetch();
  });

  const patchCategory = handleSubmit(async (formValues: CategoryInput) => {
    await patch(formValues);
    reset();
    refetch();
  });

  const deleteCategory = handleSubmit(async (formValues: CategoryInput) => {
    await remove(formValues);
    reset();
    refetch();
  });

  const toggleParent = useCallback(
    (category: BlogCategory) => {
      if (getValues('parent')?.id === category.id) {
        setValue('parent', null);
      } else {
        setValue('parent', category);
      }
    },
    [getValues, setValue],
  );

  const renderCategory = useCallback(
    (category: BlogCategory) => {
      const selected = selectedParent?.id === category.id;

      return (
        <div className="p-2 bg-basic-3 rounded" key={category.id}>
          <div className="flex justify-between">
            {selected && nowEdit ? (
              <>
                <input className="input-text" id="parent" {...register('parent.name')} />
                <div className="flex space-x-2">
                  <button type="button" className="button" onClick={patchCategory}>
                    수정
                  </button>
                  <button
                    type="button"
                    className="button bg-red-400"
                    onClick={() => setValue('nowEdit', false)}
                  >
                    취소
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                className={cn(
                  'w-fit p-1 rounded cursor-pointer t-d-1 t-basic-2',
                  selected ? 'bg-point-3 text-black' : 'hover:bg-basic-4',
                )}
                onClick={() => toggleParent(category)}
              >
                {category.name}
              </button>
            )}
            {selected && !nowEdit ? (
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="button bg-blue-400"
                  onClick={() => setValue('nowEdit', true)}
                >
                  수정
                </button>
                <button type="button" className="button bg-red-400" onClick={deleteCategory}>
                  삭제
                </button>
              </div>
            ) : null}
          </div>

          <div className="ml-4">{category.child?.map(renderCategory)}</div>
        </div>
      );
    },
    [deleteCategory, nowEdit, patchCategory, register, selectedParent, setValue, toggleParent],
  );

  const categories = categoryResponse?.data ?? [];

  return (
    <MobileScreenWrapper>
      <div className="flex flex-col p-4 bg-basic-1 rounded mb-4 gap-2">
        {categories.map(renderCategory)}
      </div>

      <div className="space-y-2">
        <input className="input-text" id="category" placeholder="" {...register('category')} />
        <button type="button" className="button" onClick={postCategory}>
          추가
        </button>
      </div>
    </MobileScreenWrapper>
  );
}
