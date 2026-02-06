'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Cookies from 'js-cookie';
import { Eye, EyeOff, Image as ImageIcon, Save } from 'lucide-react';
import { storageApi } from '@api';
import { Blog, BlogCategory } from '@api/Blog';
import { Input } from '@components/basic/Input';
import BlogDetail from '@components/blog/BlogDetail';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';
import InputTag from '~/components/complex/InputTag';
import Select from '~/components/complex/Select';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import BlogUtils from '~/utils/blogUtils';
import { submitBlog } from './actions';
import { BlogRequest, blogSchema } from './schema';

const defaultValue: BlogRequest = {
  title: '',
  thumbnailImage: undefined,
  contents: '',
  isPublic: false,
  categoryId: '',
  tags: [],
};

type SelectFC = (category: BlogCategory) => React.ReactElement;

type BlogWritePageImplProps = {
  lng: Language;
  blog: Blog | null;
  category: BlogCategory[];
};

function BlogWritePageImpl({ lng, blog, category }: BlogWritePageImplProps) {
  const { t } = useTranslation(lng, 'blog/write');
  const isEditMode = Boolean(blog);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { register, handleSubmit, setValue, getValues, control } = useForm<BlogRequest>({
    defaultValues: blog ? BlogUtils.toBlogRequest(blog, category) : defaultValue,
    resolver: zodResolver(blogSchema),
  });
  const watchedTags = useWatch({ control, name: 'tags' });
  const watchedFormData = useWatch({ control });
  const isPublic = useWatch({ control, name: 'isPublic' }) ?? false;
  const tags = useMemo(() => watchedTags ?? [], [watchedTags]);
  const categoryIdRegister = register('categoryId');
  const titleRegister = register('title', { required: true });
  const thumbnailRegister = register('thumbnailImage');
  const contentsRegister = register('contents', { required: true });
  const isPublicRegister = register('isPublic');

  const handleUploadButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const uploadImage = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      const accessToken = Cookies.get('access_token');
      if (!accessToken) return;

      const files = Array.from(e.target.files);
      const fallbackSlug = getValues('title')?.trim().replace(/\s+/g, '-') || 'draft';
      const urlSlugForAlt = blog?.urlSlug || fallbackSlug;
      const escapedSlug = urlSlugForAlt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const currentContents = getValues('contents') ?? '';
      const numberMatches = Array.from(
        currentContents.matchAll(new RegExp(`!\\[${escapedSlug}_\\((\\d+)\\)\\]\\(`, 'g')),
      );
      let nextNumber =
        numberMatches.reduce((maxNumber, match) => {
          const parsed = Number(match[1]);
          if (Number.isNaN(parsed)) return maxNumber;
          return Math.max(maxNumber, parsed);
        }, 0) + 1;
      let nextContents = currentContents.trimEnd();

      setIsUploadingImage(true);
      try {
        const uploadedImageUrls = await Promise.all(
          files.map(async (file) => {
            const { data: imageUrl } = await storageApi.postStorageImage(
              `Bearer ${accessToken}`,
              file,
            );
            return imageUrl;
          }),
        );
        uploadedImageUrls.forEach((imageUrl) => {
          const markdown = `![${urlSlugForAlt}_(${nextNumber})](${imageUrl})`;
          nextContents = nextContents ? `${nextContents}\n\n${markdown}` : markdown;
          nextNumber += 1;
        });
        setValue('contents', nextContents, { shouldDirty: true, shouldValidate: true });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to upload image', error);
      } finally {
        e.target.value = '';
        setIsUploadingImage(false);
      }
    },
    [blog?.urlSlug, getValues, setValue],
  );

  const renderSelect: SelectFC = (cat) => {
    return (
      <React.Fragment key={cat.id}>
        <option value={cat.id} key={cat.id}>
          {cat.name}
        </option>
        {cat.child?.map(renderSelect)}
      </React.Fragment>
    );
  };

  const addTag = useCallback(
    (tag: string) => {
      setValue('tags', [...tags, tag]);
    },
    [setValue, tags],
  );

  const removeTag = useCallback(
    (tag: string) => {
      setValue(
        'tags',
        tags.filter((tagItem) => tagItem !== tag),
      );
    },
    [setValue, tags],
  );

  const previewBlogData: Blog = useMemo(
    () => ({
      categoryChain: BlogUtils.findCategoryChainById(category, watchedFormData?.categoryId ?? ''),
      id: blog?.id ?? 0,
      urlSlug: blog?.urlSlug ?? '',
      likeCount: blog?.likeCount ?? 0,
      viewCount: blog?.viewCount ?? 0,
      title: watchedFormData?.title ?? '',
      contents: watchedFormData?.contents ?? '',
      isPublic: watchedFormData?.isPublic ?? false,
      thumbnailImage: watchedFormData?.thumbnailImage,
      tags: watchedFormData?.tags ?? [],
    }),
    [blog, category, watchedFormData],
  );

  const handleSubmitBlog = handleSubmit(async (formData: BlogRequest) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await submitBlog(formData, blog?.urlSlug);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div
      className={cn(
        'mx-auto w-full space-y-4 pb-24',
        isEditMode
          ? 'max-w-none px-1 pt-1 sm:px-2 md:px-3'
          : 'max-w-[1440px] px-2 pt-3 sm:px-3 md:px-4',
      )}
    >
      {!isEditMode ? (
        <ServicePageHeader
          title="블로그 작성"
          description="제목·카테고리·태그·본문을 입력하고, 우측 프리뷰로 실시간 확인할 수 있습니다."
          badge="Admin Console"
        />
      ) : null}

      <div
        className={cn(
          'grid gap-4',
          isEditMode
            ? 'items-start lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]'
            : 'lg:grid-cols-2',
        )}
      >
        <form
          onSubmit={handleSubmitBlog}
          className={cn('space-y-4', isEditMode ? 'lg:min-h-[calc(100vh-110px)]' : '')}
        >
          <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">기본 정보</h2>

            <Input
              id="title"
              className="h-10 bg-white/90 dark:bg-zinc-800/80"
              placeholder={t('form.title')}
              {...titleRegister}
            />

            <Input
              id="thumbnailImage"
              className="h-10 bg-white/90 dark:bg-zinc-800/80"
              placeholder={t('form.thumbnailImage')}
              {...thumbnailRegister}
            />

            <Select className="w-full h-10" form={categoryIdRegister}>
              <option value="">카테고리 선택</option>
              {category.map(renderSelect)}
            </Select>

            <InputTag tags={tags} addTag={addTag} removeTag={removeTag} />
          </section>

          <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">본문 작성</h2>
            <textarea
              className={cn(
                'w-full resize-y rounded-xl border border-zinc-200 bg-white/90 p-3 text-sm leading-relaxed text-zinc-900 outline-none transition-colors focus:border-point-2 focus:ring-2 focus:ring-point-2/40 dark:border-zinc-700 dark:bg-zinc-800/85 dark:text-zinc-100',
                isEditMode
                  ? 'min-h-[calc(100vh-380px)] lg:min-h-[calc(100vh-270px)]'
                  : 'min-h-[360px]',
              )}
              id="content"
              placeholder="마크다운 본문을 입력하세요."
              {...contentsRegister}
            />
          </section>

          <section className={cn(SERVICE_PANEL_SOFT, 'flex flex-wrap items-center gap-3 p-4')}>
            <label
              htmlFor="isPublic"
              className={cn(
                SERVICE_CARD_INTERACTIVE,
                'inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white/85 px-3 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200',
              )}
            >
              <input className="h-4 w-4" type="checkbox" id="isPublic" {...isPublicRegister} />
              {isPublic ? (
                <Eye className="h-4 w-4 text-emerald-500" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              <span>{isPublic ? '공개 글' : '비공개 글'}</span>
            </label>

            <button
              type="submit"
              className={cn(
                SERVICE_CARD_INTERACTIVE,
                'inline-flex h-10 items-center gap-1 rounded-xl bg-point-1 px-4 text-sm font-bold text-white transition-colors hover:bg-point-2 disabled:cursor-not-allowed disabled:opacity-55',
              )}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? '저장 중...' : t('post')}
            </button>

            <button
              type="button"
              className="inline-flex h-10 items-center rounded-xl border border-zinc-200 bg-white/85 px-4 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:bg-zinc-700"
              onClick={handleUploadButtonClick}
              disabled={isUploadingImage}
            >
              <ImageIcon className="mr-1 h-4 w-4" />
              {isUploadingImage ? '업로드 중...' : '본문 이미지 업로드'}
            </button>
            <input
              className="hidden"
              id="upload-image"
              type="file"
              accept="image/png, image/jpeg"
              multiple
              ref={fileInputRef}
              onChange={uploadImage}
            />
            <p className="w-full text-xs text-zinc-500 dark:text-zinc-400">
              업로드한 이미지는 본문 하단에 `![urlSlug_(번호)](image_url)` 형식으로 자동 삽입됩니다.
            </p>
          </section>
        </form>

        <aside
          className={cn(
            SERVICE_PANEL_SOFT,
            'hidden lg:block',
            isEditMode
              ? 'lg:sticky lg:top-3 lg:max-h-[calc(100vh-110px)] overflow-hidden'
              : 'h-fit',
          )}
        >
          <div className="flex items-center gap-2 border-b border-zinc-200/90 px-4 py-3 dark:border-zinc-700/80">
            <Eye className="h-4 w-4 text-point-1" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">실시간 프리뷰</h2>
          </div>
          <div
            className={cn(
              'overflow-y-auto px-3 py-2',
              isEditMode ? 'max-h-[calc(100vh-160px)]' : 'max-h-[calc(100vh-260px)]',
            )}
          >
            <BlogDetail blog={previewBlogData} isPreview lng={lng} />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default BlogWritePageImpl;
