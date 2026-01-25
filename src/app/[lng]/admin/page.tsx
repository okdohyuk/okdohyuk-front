import React from 'react';
import Link from '@components/basic/Link';
import MobileScreenWrapper from '~/components/complex/Layout/MobileScreenWrapper';

const ADMIN_MENUS = [
  { href: '/admin/blog', label: 'Blog 관리' },
  { href: '/admin/blog/category', label: '카테고리 관리' },
  { href: '/admin/reply-report', label: '댓글 신고 관리' },
  { href: '/admin/users', label: '유저 관리' },
  // 추후 추가될 메뉴는 이 배열에 추가
];

export default function AdminPage() {
  return (
    <MobileScreenWrapper>
      <h1 className="text-2xl font-bold mb-4">관리자 대시보드</h1>
      <p className="mb-6 t-basic-2">
        관리자 전용 페이지입니다. 아래 메뉴에서 원하는 관리 기능을 선택하세요.
      </p>
      <nav className="flex gap-4">
        {ADMIN_MENUS.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className="px-4 py-2 rounded bg-basic-4 hover:bg-point-1 hover:text-white t-c-2"
          >
            {menu.label}
          </Link>
        ))}
      </nav>
    </MobileScreenWrapper>
  );
}
