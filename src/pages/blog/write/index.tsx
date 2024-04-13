import React from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Blog, BlogCategory, BlogRequest } from '@api/Blog';
import { useTranslation, withTranslation } from 'next-i18next';
import { blogApi, storageApi, userApi } from '@api';
import { UserRoleEnum } from '~/spec/api/User';
import Jwt from '~/utils/jwtUtils';
import BlogDetail from '@components/blog/BlogDetail';
import { SubmitHandler, useForm } from 'react-hook-form';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import Opengraph from '~/components/basic/Opengraph';
import { MdImage } from 'react-icons/md';
import { accessToken } from '~/utils/userTokenUtil';
import BlogUtils from '~/utils/blogUtils';
import InputTag from '~/components/complex/InputTag';
import Select from '~/components/complex/Select';

type BlogPageProps = {
  blog: Blog | null;
  categorys: BlogCategory[];
};

const defaultValue: BlogRequest = {
  title: '',
  thumbnailImage: '',
  contents: '',
  isPublic: false,
  categoryId: '',
  tags: [],
};

type SelectFC = (category: BlogCategory) => React.ReactElement;

function BlogWritePage({ blog, categorys }: BlogPageProps) {
  const { t } = useTranslation('blog/write');
  const { register, watch, handleSubmit, setValue } = useForm<Blog & BlogRequest>({
    defaultValues: blog ? BlogUtils.toBlogRequest(blog, categorys) : defaultValue,
  });
  const tags = watch('tags');
  const [imageUrl, setImageUrl] = React.useState<string>('');
  const { push } = useRouter();

  const onSubmit: SubmitHandler<BlogRequest> = async (submitBlog) => {
    console.log(submitBlog.tags);

    try {
      if (!blog) {
        await blogApi.postBlog(accessToken, submitBlog);
      } else {
        await blogApi.patchBlogUrlSlug(blog.urlSlug, accessToken, submitBlog);
      }

      push('/admin/blog');
    } catch (e) {
      console.error('-> e', e);
    }
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

  return (
    <>
      <Opengraph title={'Blog Edit '} ogTitle={'Blog Edit'} description={'Blog Edit'} />
      <div className="flex w-full h-screen overflow-hidden">
        <div className="flex-1 flex flex-col relative pb-16">
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
              {categorys.map(renderSelect)}
            </Select>

            <InputTag tags={tags} addTag={addTag} removeTag={removeTag} />

            <div className="flex gap-2">
              <input className="input-text flex-1" value={imageUrl} readOnly />
              <div>
                <label className="" htmlFor={'upload-image'} onClick={onClickHandler}>
                  <button className="button h-[38px]">
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
            <button className="button h-8" onClick={handleSubmit(onSubmit)}>
              {t('post')}
            </button>
          </div>
        </div>

        <div className="flex-1 hidden lg:block overflow-y-scroll">
          <BlogDetail blog={watch()} isPreview />
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req: {
    cookies: { access_token: accessToken },
  },
  query: { urlSlug },
  locale,
}) => {
  if (!accessToken) return { notFound: true };
  const jwt = Jwt;
  const tokenPayload = jwt.getPayload(accessToken);
  if (tokenPayload && !tokenPayload.id) return { notFound: true };

  try {
    const { data: user } = await userApi.getUserUserId('Bearer ' + accessToken, tokenPayload.id);
    if (user.role !== UserRoleEnum.Admin) return { notFound: true };

    const translations = await serverSideTranslations(locale + '', ['common', 'blog/write']);
    const { data: categorys } = await blogApi.getBlogCategory();

    if (!urlSlug)
      return {
        props: {
          ...translations,
          blog: null,
          categorys,
        },
      };

    const { data: blog } = await blogApi.getBlogUrlSlug(urlSlug + '', 'Bearer ' + accessToken);

    return {
      props: {
        ...translations,
        blog,
        categorys,
      },
    };
  } catch (e) {
    console.error('-> e', e);
    return { notFound: true };
  }
};

export default withTranslation(['common', 'blog/write'])(BlogWritePage);
