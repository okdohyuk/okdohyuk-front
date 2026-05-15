import React from 'react';
import Link from 'next/link';

export default function ShortLinkNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      <p className="text-sm font-semibold tracking-wide text-fg-5">404 / 410</p>
      <h1 className="text-2xl font-extrabold text-fg-1">링크를 찾을 수 없거나 만료되었어요</h1>
      <p className="text-sm leading-relaxed text-fg-4">
        요청하신 단축 링크는 더 이상 유효하지 않습니다.
        <br />
        새로운 단축 URL 을 만들어 보세요.
      </p>
      <Link
        href="/ko/shortener"
        className="mt-2 inline-flex h-10 items-center rounded-md bg-point-2 px-4 text-sm font-semibold text-white transition hover:bg-point-1"
      >
        단축 URL 만들러 가기
      </Link>
    </main>
  );
}
