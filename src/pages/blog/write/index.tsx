import React from 'react';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Blog } from '@api/Blog';
import { useTranslation, withTranslation } from 'next-i18next';
import { blogApi, storageApi, userApi } from '@api';
import { UserRoleEnum } from '~/spec/api/User';
import Jwt from '~/utils/jwtUtils';
import BlogPost from '~/components/Complex/Blog';
import { SubmitHandler, useForm } from 'react-hook-form';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import Opengraph from '~/components/Basic/Opengraph';
import { MdImage } from 'react-icons/md';
import MobileScreenWrapper from '@components/Complex/Layouts/MobileScreenWrapper';

type BlogPageProps = {
  blog: Blog | null;
};

function BlogWritePage({ blog }: BlogPageProps) {
  const { t } = useTranslation('blog/write');
  const { register, watch, handleSubmit } = useForm<Blog>({
    defaultValues: blog ? blog : { createdAt: new Date().toString(), contents: '' },
  });
  const [imageUrl, setImageUrl] = React.useState<string>('');
  const { push } = useRouter();

  const onSubmit: SubmitHandler<Blog> = async (submitBlog) => {
    const accessToken = Cookies.get('access_token');
    try {
      if (!blog) {
        await blogApi.postBlog('Bearer ' + accessToken, submitBlog);
      } else {
        await blogApi.putBlogUrlSlug('Bearer ' + accessToken, blog.urlSlug, submitBlog);
      }
      if (submitBlog.isPublic) {
        push('/blog/' + submitBlog.title.replaceAll(' ', '-'));
      } else {
        push('/admin/blog');
      }
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
            <div className="flex gap-2">
              <input className="input-text flex-1" value={imageUrl} />
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
          <MobileScreenWrapper>
            <BlogPost blog={watch()} />
          </MobileScreenWrapper>
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

    if (!urlSlug)
      return {
        props: {
          ...translations,
          blog: null,
        },
      };

    const { data: blog } = await blogApi.getBlogUrlSlug(urlSlug + '', 'Bearer ' + accessToken);

    return {
      props: {
        ...translations,
        blog,
      },
    };
  } catch (e) {
    console.error('-> e', e);
    return { notFound: true };
  }
};

export default withTranslation(['common', 'blog/write'])(BlogWritePage);
