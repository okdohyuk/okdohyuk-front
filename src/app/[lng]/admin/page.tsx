import React from 'react';
import Link from '@components/basic/Link';
import { LanguageParams } from '~/app/[lng]/layout';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import ServiceInfoNotice from '@components/complex/Service/ServiceInfoNotice';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { ArrowRight, FolderKanban, MessageSquareWarning, ShieldCheck, Users } from 'lucide-react';
import { cn } from '@utils/cn';

const ADMIN_MENUS = [
  {
    href: '/admin/blog',
    label: 'Blog 관리',
    description: '게시글 목록, 상태, 수정 플로우를 관리합니다.',
    icon: FolderKanban,
  },
  {
    href: '/admin/blog/category',
    label: '카테고리 관리',
    description: '블로그 카테고리 구조와 노출 순서를 정리합니다.',
    icon: FolderKanban,
  },
  {
    href: '/admin/reply-report',
    label: '댓글 신고 관리',
    description: '신고 내역을 검토하고 댓글 관련 조치를 처리합니다.',
    icon: MessageSquareWarning,
  },
  {
    href: '/admin/users',
    label: '유저 관리',
    description: '사용자 정보와 권한(Role)을 업데이트합니다.',
    icon: Users,
  },
];

export default async function AdminPage({ params }: LanguageParams) {
  const { lng } = await params;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-2 pb-24 pt-3 sm:px-3 md:px-4">
      <ServicePageHeader
        title="관리자 대시보드"
        description="관리자 전용 페이지입니다. 아래 메뉴에서 원하는 관리 기능을 선택하세요."
        badge="Admin Console"
      />

      <ServiceInfoNotice icon={<ShieldCheck className="h-5 w-5" />}>
        권한이 있는 관리자만 접근 가능한 페이지입니다.
      </ServiceInfoNotice>

      <nav className="grid gap-3 sm:grid-cols-2">
        {ADMIN_MENUS.map((menu) => {
          const Icon = menu.icon;

          return (
            <Link
              key={menu.href}
              href={`/${lng}${menu.href}`}
              className={cn(
                SERVICE_PANEL_SOFT,
                SERVICE_CARD_INTERACTIVE,
                'group flex min-h-28 items-start gap-3 p-4',
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white/90 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                  {menu.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {menu.description}
                </p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-point-1 dark:text-zinc-500" />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
