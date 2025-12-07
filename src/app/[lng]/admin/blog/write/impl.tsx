'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Cookies from 'js-cookie';
import { Image as ImageIcon } from 'lucide-react';
import { storageApi } from '@api';
import { Blog, BlogCategory } from '@api/Blog';
import BlogDetail from '@components/blog/BlogDetail';
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
  const { pending } = useFormStatus();

  const { register, watch, handleSubmit, setValue } = useForm<BlogRequest>({
    defaultValues: blog ? BlogUtils.toBlogRequest(blog, category) : defaultValue,
    resolver: zodResolver(blogSchema),
  });
  const watchedTags = watch('tags');
  const tags = useMemo(() => watchedTags ?? [], [watchedTags]);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const categoryIdRegister = register('categoryId');
  const titleRegister = register('title', { required: true });
  const thumbnailRegister = register('thumbnailImage');
  const contentsRegister = register('contents', { required: true });
  const isPublicRegister = register('isPublic');

  const handleUploadButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const uploadImage = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    const accessToken = Cookies.get('access_token');
    if (!accessToken) return;
    try {
      const { data } = await storageApi.postStorageImage(`Bearer ${accessToken}`, file);
      setImageUrl(data);
    } catch (error) {
      setImageUrl(undefined);
    }
  }, []);

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

  const watchedFormData = watch();
  const blogData: Blog = useMemo(
    () => ({
      categoryChain: BlogUtils.findCategoryChainById(category, watchedFormData.categoryId),
      id: 0,
      urlSlug: '',
      ...watchedFormData,
    }),
    [category, watchedFormData],
  );

  const handleSubmitBlog = handleSubmit(async (formData: BlogRequest) => {
    await submitBlog(formData, blog?.urlSlug);
  });

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <form onSubmit={handleSubmitBlog} className="flex-1 flex flex-col relative pb-16">
        <div className="flex flex-col p-4 gap-4">
          <input
            className="input-text"
            id="title"
            placeholder={t('form.title')}
            {...titleRegister}
          />
          <input
            className="input-text"
            id="thumbnailImage"
            placeholder={t('form.thumbnailImage')}
            {...thumbnailRegister}
          />

          <Select form={categoryIdRegister}>
            <option value="">-</option>
            {category.map(renderSelect)}
          </Select>

          <InputTag tags={tags} addTag={addTag} removeTag={removeTag} />

          <div className="flex gap-2">
            <input className="input-text flex-1" value={imageUrl ?? ''} readOnly />
            <div>
              <button type="button" className="button h-[38px]" onClick={handleUploadButtonClick}>
                <ImageIcon size={24} />
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
            </div>
          </div>
        </div>

        <textarea
          className="w-full h-full resize-none input-text outline-none rounded-none"
          id="content"
          {...contentsRegister}
        />

        <div className="w-full lg:w-1/2 flex justify-between items-center fixed bottom-[57px] lg:bottom-0 left-0 h-16 bg-basic-5 px-4">
          <input className="" type="checkbox" id="isPublic" {...isPublicRegister} />
          <button
            type="submit"
            className="button h-8 disabled:cursor-not-allowed"
            disabled={pending}
          >
            {t('post')}
          </button>
        </div>
      </form>

      <div className="flex-1 hidden lg:block overflow-y-scroll">
        <BlogDetail blog={blogData} isPreview />
      </div>
    </div>
  );
}

export default BlogWritePageImpl;
