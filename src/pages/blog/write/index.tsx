import React from 'react';
import { GetServerSideProps, GetStaticPaths, GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Blog } from '@api/Blog';
import { withTranslation } from 'next-i18next';
import { blogApi, userApi } from '@api';
import { UserRoleEnum } from '~/spec/api/User';
import Jwt from '~/utils/jwtUtils';
import BlogPost from '~/components/Complex/Blog';
import { SubmitHandler, useForm } from 'react-hook-form';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

type BlogPageProps = {
  blog: Blog | null;
};

function BlogEditPage({ blog }: BlogPageProps) {
  const { register, watch, handleSubmit } = useForm<Blog>({ defaultValues: blog ? blog : {} });
  const { push } = useRouter();

  const onSubmit: SubmitHandler<Blog> = async (submitBlog) => {
    const accessToken = Cookies.get('access_token');
    try {
      if (!blog) {
        await blogApi.postBlog('Bearer ' + accessToken, submitBlog);
      } else {
        await blogApi.putBlogUrlSlug('Bearer ' + accessToken, blog.urlSlug, submitBlog);
      }
      push('/blog/' + submitBlog.title.replaceAll(' ', '-'));
    } catch (e) {
      console.error('-> e', e);
    }
  };

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <div className="flex-1 flex flex-col relative pb-16">
        <input
          className="w-full input-text"
          id="title"
          {...register('title', {
            required: true,
          })}
        />
        <input className="" type="checkbox" id="isPublic" {...register('isPublic')} />
        <textarea
          className="w-full h-full resize-none input-text"
          id="content"
          {...register('contents', {
            required: true,
          })}
        />
        <div className="w-full lg:w-1/2 flex flex-row-reverse items-center fixed bottom-[57px] lg:bottom-0 left-0 h-16 bg-basic-5 px-4">
          <button className="button h-8" onClick={handleSubmit(onSubmit)}>
            Post
          </button>
        </div>
      </div>
      <div className="flex-1 hidden lg:block overflow-y-scroll">
        <div className="relative lg:px-6 lg:py-6 box-border bg-zinc-100 dark:bg-zinc-900">
          <BlogPost blog={watch()} />
        </div>
      </div>
    </div>
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

    const translations = await serverSideTranslations(locale as string, ['common', 'blog']);

    if (!urlSlug)
      return {
        props: {
          ...translations,
          blog: null,
        },
      };

    const { data: blog } = await blogApi.getBlogUrlSlug(urlSlug + '');

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

export default withTranslation(['common', 'blog'])(BlogEditPage);
