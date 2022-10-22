import React from 'react';
import { NextPageContext } from 'next';
import axios from 'axios';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Blog } from '@assets/type';
import Opengraph from '@components/opengraph';
import markdownUtils from '@utils/markdownUtils';
import { format } from 'date-fns';
import Markdown from 'markdown-to-jsx';
import AutoHeightImage from '@components/Image/AutoHeightImage';

type BlogPageProps = {
  blog: Blog;
};

type MarkdownItem = {
  children: React.ReactNode;
  [key: string]: any;
};

const MarkDownHeader2 = ({ children, ...props }: MarkdownItem) => (
  <h2
    {...props}
    className={'text-xl my-3 border-b border-zinc-800 dark:border-zinc-300 border-solid'}
  >
    {children}
  </h2>
);

const MarkDownHeader3 = ({ children, ...props }: MarkdownItem) => (
  <h3 {...props} className={'text-lg my-3'}>
    {children}
  </h3>
);

const MarkDownP = ({ children, ...props }: MarkdownItem) => (
  <p {...props} className={'text-md leading-6 my-1'}>
    {children}
  </p>
);

const MarkDownPre = ({ children, ...props }: MarkdownItem) => (
  <pre
    {...props}
    className={
      'w-full overflow-y-scroll bg-gray-300 dark:bg-gray-900 p-2 my-3 rounded [&>code]:p-0 [&>code]:bg-transparent [&>code]:rounded-0 [&>code]:text-black dark:[&>code]:text-white'
    }
  >
    {children}
  </pre>
);

const MarkDownCode = ({ children, ...props }: MarkdownItem) => (
  <code {...props} className={'bg-gray-300 dark:bg-gray-800 text-md text-red-500 p-0.5 rounded'}>
    {children}
  </code>
);

const MarkDownAside = ({ children, ...props }: MarkdownItem) => (
  <aside {...props} className={'w-full bg-gray-400 dark:bg-gray-700 p-2 rounded my-3'}>
    {children}
  </aside>
);
const MarkDownA = ({ children, ...props }: MarkdownItem) => (
  <a {...props} className={'text-blue-800 dark:text-blue-600'}>
    {children}
  </a>
);

const MarkDownImg = ({ ...props }: MarkdownItem) => (
  <div className={'w-full my-3'}>
    <AutoHeightImage src={''} {...props}></AutoHeightImage>
  </div>
);

function BlogPage({ blog }: BlogPageProps) {
  const { title, contents, createdAt, thumbnailImage } = blog;
  return (
    <div className={'w-full min-h-screen dark:bg-black pb-[70px] lg:pb-auto'}>
      <Opengraph
        title={title}
        ogTitle={title}
        description={markdownUtils.removeMarkdown(contents).slice(0, 200) + '...'}
        image={thumbnailImage ? thumbnailImage : undefined}
      />
      <div className="flex flex-col gap-6 text-black dark:text-white">
        <article className={'w-full md:w-[750px] p-4 pt-10 md:p-0 md:pt-10 mx-auto'}>
          <div
            className={
              'border-b-2 border-zinc-800 dark:border-zinc-300 border-solid space-y-2 pb-4 mb-6'
            }
          >
            <h1 className={'text-black dark:text-white text-xl md:text-3xl'}>{title}</h1>
            <div>{format(new Date(createdAt), 'yyyy-MM-dd')}</div>
          </div>
          <Markdown
            options={{
              forceBlock: true,
              overrides: {
                h2: {
                  component: MarkDownHeader2,
                },
                h3: {
                  component: MarkDownHeader3,
                },
                img: {
                  component: MarkDownImg,
                },
                pre: {
                  component: MarkDownPre,
                },
                code: {
                  component: MarkDownCode,
                },
                aside: {
                  component: MarkDownAside,
                },
                p: { component: MarkDownP },
                a: { component: MarkDownA },
              },
            }}
          >
            {contents}
          </Markdown>
        </article>
      </div>
    </div>
  );
}

export async function getServerSideProps({ req, query, locale, defaultLocale }: NextPageContext) {
  if (!req) return { notFound: true };
  if (!(query && query.urlSlug)) return { notFound: true };
  const { urlSlug } = query;
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  try {
    const { data } = await axios.get(
      `${protocol}://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/blog/${urlSlug}`,
    );
    if (!data) throw 'body is null';
    const translations = await serverSideTranslations(locale ?? (defaultLocale as string), [
      'common',
      'blog',
    ]);
    return {
      props: {
        ...translations,
        blog: data.blog,
      },
    };
  } catch (e) {
    console.error('-> e', e);
    return { notFound: true };
  }
}

export default BlogPage;
