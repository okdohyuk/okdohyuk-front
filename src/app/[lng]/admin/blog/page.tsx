'use client';

import React, { use, useEffect } from 'react';
import BlogCard from '@components/blog/BlogCard';
import useStore from '@hooks/useStore';
import useInfiniteScroll from '@hooks/useInfiniteScroll';
import { observer } from 'mobx-react';
import Link from '@components/basic/Link';
import {
  FilePenLine,
  FileSearch,
  FolderKanban,
  Plus,
  RefreshCcw,
  Sparkles,
  SquarePen,
} from 'lucide-react';
import { BlogSearch } from '~/spec/api/Blog';
import { LanguageParams } from '~/app/[lng]/layout';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import ServiceInfoNotice from '@components/complex/Service/ServiceInfoNotice';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';

function BlogAdminPage({ params }: LanguageParams) {
  const { lng } = use(params);
  const { blogs, getBlogsPage, status, isLastPage } = useStore('blogStore');
  const { setIsFetching, isFetching } = useInfiniteScroll();
  const blogCount = blogs?.length ?? 0;

  useEffect(() => {
    if (!isFetching) return;
    getBlogsPage(10);
  }, [getBlogsPage, isFetching]);

  useEffect(() => {
    if (isLastPage) return;
    if (status === 'success') {
      setIsFetching(false);
    }
  }, [isLastPage, setIsFetching, status]);

  useEffect(() => {
    if (status === 'idle') setIsFetching(true);
  }, [setIsFetching, status]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-2 pb-24 pt-3 sm:px-3 md:px-4">
      <ServicePageHeader
        title="블로그 관리"
        description="게시글을 탐색하고 수정하거나, 새 글을 작성할 수 있습니다."
        badge="Admin Console"
      />

      <ServiceInfoNotice
        icon={<FolderKanban className="h-5 w-5" />}
        action={
          <Link
            href={`/${lng}/admin/blog/write`}
            className={cn(
              SERVICE_CARD_INTERACTIVE,
              'inline-flex h-10 items-center gap-1 rounded-xl bg-point-1 px-4 text-sm font-bold text-white transition-colors hover:bg-point-2',
            )}
          >
            <Plus className="h-4 w-4" />새 글 작성
          </Link>
        }
      >
        목록 카드를 클릭하면 바로 편집 페이지로 이동합니다.
      </ServiceInfoNotice>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileSearch className="h-4 w-4 text-point-1" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">게시글 목록</h2>
          </div>
          <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-[11px] font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
            Total {blogCount}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {blogs?.map((blog) => (
            <BlogCard key={blog.urlSlug} blog={blog as BlogSearch} isAdmin type="board" />
          ))}

          {status === 'loading' ? (
            <div className="flex items-center justify-center gap-2 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
              <RefreshCcw className="h-4 w-4 animate-spin" />
              로딩 중...
            </div>
          ) : null}

          {!isLastPage && status !== 'loading' && blogCount > 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300/90 bg-white/65 px-4 py-3 text-center text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
              페이지 하단으로 스크롤하면 다음 게시글을 자동으로 불러옵니다.
            </div>
          ) : null}

          {status !== 'loading' && blogCount === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300/90 bg-white/65 px-4 py-8 text-center dark:border-zinc-700 dark:bg-zinc-900/60">
              <div className="mb-2 flex items-center justify-center gap-2 text-zinc-500 dark:text-zinc-300">
                <Sparkles className="h-4 w-4 text-point-1" />
                <SquarePen className="h-4 w-4 text-point-1" />
                <FilePenLine className="h-4 w-4 text-point-1" />
              </div>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                아직 게시글이 없습니다.
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                우측 상단의 `새 글 작성` 버튼으로 첫 글을 작성해보세요.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default observer(BlogAdminPage);
