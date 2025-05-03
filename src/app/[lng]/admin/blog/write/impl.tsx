'use client';

import React from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { blogSchema, BlogRequest } from './schema';
import { submitBlog } from './actions';
import { useTranslation } from '~/app/i18n/client';
import BlogDetail from '@components/legacy/blog/BlogDetail';
import InputTag from '~/components/complex/InputTag';
import Select from '~/components/complex/Select';
import { MdImage } from 'react-icons/md';
import { Blog, BlogCategory } from '@api/Blog';
import BlogUtils from '~/utils/blogUtils';
import { Language } from '~/app/i18n/settings';
import { storageApi } from '@api';
import Cookies from 'js-cookie';

const defaultValue: BlogRequest = {
  title: '',
  thumbnailImage: undefined,
  contents: '',
  isPublic: false,
  categoryId: '',
  tags: [],
};

type SelectFC = (category: BlogCategory) => React.ReactElement;

const BlogWritePageImpl = ({
  lng,
  blog,
  category,
}: {
  lng: Language;
  blog: Blog | null;
  category: BlogCategory[];
}) => {
  const { t } = useTranslation(lng, 'blog/write');
  const { pending } = useFormStatus();

  const { register, watch, handleSubmit, setValue } = useForm<BlogRequest>({
    defaultValues: blog ? BlogUtils.toBlogRequest(blog, category) : defaultValue,
    resolver: zodResolver(blogSchema),
  });
  const tags = watch('tags');
  const [imageUrl, setImageUrl] = React.useState<string | undefined>();

  const updateBlog = async (nBlog: BlogRequest) => {
    await submitBlog(nBlog, blog?.urlSlug);
  };

  const onClickHandler = (e: React.MouseEvent<HTMLLabelElement, MouseEvent>) => {
    if (e.target !== e.currentTarget) e.currentTarget.click();
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    const accessToken = Cookies.get('access_token');
    try {
      const { data } = await storageApi.postStorageImage('Bearer ' + accessToken, file);
      setImageUrl(data);
    } catch (e) {
      console.error('-> e', e);
    }
  };

  const renderSelect: SelectFC = (category) => {
    return (
      <React.Fragment key={category.id}>
        <option value={category.id} key={category.id}>
          {category.name}
        </option>
        {category.child?.map(renderSelect)}
      </React.Fragment>
    );
  };

  function addTag(tag: string): void {
    setValue('tags', [...tags, tag]);
  }

  function removeTag(tag: string): void {
    setValue(
      'tags',
      tags.filter((t) => t !== tag),
    );
  }

  const watchedFormData = watch();
  const blogData: Blog = {
    categoryChain: BlogUtils.findCategoryChainById(category, watchedFormData.categoryId),
    id: 0,
    urlSlug: '',
    ...watchedFormData,
    // Add any additional transformations if necessary
  };

  const onValid = () => {
    handleSubmit(updateBlog)();
  };

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <form action={onValid} className="flex-1 flex flex-col relative pb-16">
        <div className="flex flex-col p-4 gap-4">
          <input
            className="input-text"
            id="title"
            placeholder={t('form.title')}
            {...register('title', {
              required: true,
            })}
          />
          <input
            className="input-text"
            id="thumbnailImage"
            placeholder={t('form.thumbnailImage')}
            {...register('thumbnailImage')}
          />

          <Select form={register('categoryId')}>
            <option value="">-</option>
            {category.map(renderSelect)}
          </Select>

          <InputTag tags={tags} addTag={addTag} removeTag={removeTag} />

          <div className="flex gap-2">
            <input className="input-text flex-1" value={imageUrl ?? ''} readOnly />
            <div>
              <label className="" htmlFor={'upload-image'} onClick={onClickHandler}>
                <button type="button" className="button h-[38px]">
                  <MdImage size={24} />
                </button>
              </label>
              <input
                className="hidden"
                id={'upload-image'}
                type="file"
                accept="image/png, image/jpeg"
                multiple
                onChange={uploadImage}
              />
            </div>
          </div>
        </div>

        <textarea
          className="w-full h-full resize-none input-text outline-none rounded-none"
          id="content"
          {...register('contents', {
            required: true,
          })}
        />

        <div className="w-full lg:w-1/2 flex justify-between items-center fixed bottom-[57px] lg:bottom-0 left-0 h-16 bg-basic-5 px-4">
          <input className="" type="checkbox" id="isPublic" {...register('isPublic')} />
          <button className="button h-8 disabled:cursor-not-allowed" disabled={pending}>
            {t('post')}
          </button>
        </div>
      </form>

      <div className="flex-1 hidden lg:block overflow-y-scroll">
        <BlogDetail blog={blogData} isPreview />
      </div>
    </div>
  );
};

export default BlogWritePageImpl;
