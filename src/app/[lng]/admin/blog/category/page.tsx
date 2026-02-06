'use client';

import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { blogApi } from '@api';
import { BlogCategory } from '@api/Blog';
import { Input } from '@components/basic/Input';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import ServiceInfoNotice from '@components/complex/Service/ServiceInfoNotice';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { UseCategoryProps } from '@hooks/blog/type';
import useBlogCategory from '@hooks/blog/useBlogCategory';
import { cn } from '@utils/cn';
import { FolderTree, Pencil, Plus, Trash2 } from 'lucide-react';

type CategoryInput = {
  nowEdit: boolean;
} & UseCategoryProps;

export default function CategorySettingPage() {
  const { register, handleSubmit, setValue, getValues, reset, control } = useForm<CategoryInput>({
    defaultValues: { nowEdit: false, category: '', parent: null },
  });
  const nowEdit = useWatch({ control, name: 'nowEdit' });
  const selectedParent = useWatch({ control, name: 'parent' });
  const categoryName = useWatch({ control, name: 'category' });

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
    reset({ nowEdit: false, category: '', parent: null });
    refetch();
  });

  const patchCategory = handleSubmit(async (formValues: CategoryInput) => {
    await patch(formValues);
    reset({ nowEdit: false, category: '', parent: null });
    refetch();
  });

  const deleteCategory = handleSubmit(async (formValues: CategoryInput) => {
    await remove(formValues);
    reset({ nowEdit: false, category: '', parent: null });
    refetch();
  });

  const toggleParent = (category: BlogCategory) => {
    if (getValues('parent')?.id === category.id) {
      setValue('parent', null);
      setValue('nowEdit', false);
    } else {
      setValue('parent', category);
      setValue('nowEdit', false);
    }
  };

  const renderCategory = (category: BlogCategory, depth = 0): React.ReactNode => {
    const selected = selectedParent?.id === category.id;
    const childCount = category.child?.length ?? 0;

    return (
      <div
        className={cn(
          SERVICE_CARD_INTERACTIVE,
          'space-y-2 rounded-xl border p-3 transition-colors',
          selected
            ? 'border-point-2/70 bg-point-4/45 dark:border-point-2/55 dark:bg-point-1/15'
            : 'border-zinc-200/80 bg-white/75 dark:border-zinc-700/80 dark:bg-zinc-900/70',
        )}
        key={category.id}
      >
        <div className="flex flex-wrap items-center gap-2">
          {selected && nowEdit ? (
            <>
              <Input
                id="parent"
                {...register('parent.name')}
                className="h-9 flex-1 bg-white/90 dark:bg-zinc-800/80"
              />
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-point-1 px-3 text-xs font-bold text-white transition-colors hover:bg-point-2"
                  onClick={patchCategory}
                >
                  저장
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white/85 px-3 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:bg-zinc-700"
                  onClick={() => {
                    setValue('parent', category);
                    setValue('nowEdit', false);
                  }}
                >
                  취소
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                className={cn(
                  'inline-flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-semibold transition-colors',
                  selected
                    ? 'bg-point-4/90 text-point-1 dark:bg-point-1/25 dark:text-point-2'
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800/80',
                )}
                onClick={() => toggleParent(category)}
              >
                <span className="truncate">{category.name}</span>
                {childCount > 0 ? (
                  <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                    +{childCount}
                  </span>
                ) : null}
              </button>

              {selected ? (
                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-3 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-100 dark:border-sky-500/50 dark:bg-sky-500/20 dark:text-sky-100 dark:hover:bg-sky-500/30"
                    onClick={() => setValue('nowEdit', true)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    수정
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-500/50 dark:bg-red-500/20 dark:text-red-100 dark:hover:bg-red-500/30"
                    onClick={deleteCategory}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    삭제
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>

        {category.child?.length ? (
          <div
            className={cn(
              'space-y-2 border-l border-dashed pl-3',
              depth >= 1
                ? 'border-zinc-300/90 dark:border-zinc-700/80'
                : 'border-zinc-200 dark:border-zinc-700',
            )}
          >
            {category.child.map((child) => renderCategory(child, depth + 1))}
          </div>
        ) : null}
      </div>
    );
  };

  const categories = categoryResponse?.data ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-2 pb-24 pt-3 sm:px-3 md:px-4">
      <ServicePageHeader
        title="카테고리 관리"
        description="카테고리 트리 구조를 확인하고, 이름 수정/삭제/추가를 빠르게 처리하세요."
        badge="Admin Console"
      />

      <ServiceInfoNotice icon={<FolderTree className="h-5 w-5" />}>
        항목을 선택하면 수정·삭제가 가능하고, 선택된 항목은 신규 카테고리의 부모로 사용됩니다.
      </ServiceInfoNotice>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">카테고리 트리</h2>
          <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-[11px] font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
            Root {categories.length}
          </span>
        </div>

        <div className="space-y-2">
          {categories.length > 0 ? (
            categories.map((category) => renderCategory(category))
          ) : (
            <p className="rounded-lg border border-dashed border-zinc-300/90 bg-white/70 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
              등록된 카테고리가 없습니다.
            </p>
          )}
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-3 p-4')}>
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">카테고리 추가</h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-300">
          현재 부모:
          <span className="ml-1 font-semibold text-point-1 dark:text-point-2">
            {selectedParent ? selectedParent.name : '최상위 (ROOT)'}
          </span>
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="category"
            className="h-10 flex-1 bg-white/90 dark:bg-zinc-800/80"
            placeholder="새 카테고리 이름"
            {...register('category')}
          />
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-point-1 px-4 text-sm font-bold text-white transition-colors hover:bg-point-2 disabled:cursor-not-allowed disabled:opacity-55"
            onClick={postCategory}
            disabled={!categoryName?.trim()}
          >
            <Plus className="h-4 w-4" />
            추가
          </button>
        </div>

        {selectedParent ? (
          <button
            type="button"
            className="inline-flex h-9 w-fit items-center justify-center rounded-lg border border-zinc-200 bg-white/85 px-3 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:bg-zinc-700"
            onClick={() => {
              setValue('parent', null);
              setValue('nowEdit', false);
            }}
          >
            부모 선택 해제
          </button>
        ) : null}
      </section>
    </div>
  );
}
