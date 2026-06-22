import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { buildLoginUrl } from '@utils/loginRedirect';
import { Language } from '~/app/i18n/settings';
import { SolveAttemptMode } from '@api/Solve';
import QuizClient from './QuizClient';

export const dynamic = 'force-dynamic';

type SolveQuizParams = {
  params: Promise<{ lng: string; slug: string }>;
  searchParams: Promise<{ unitId?: string; mode?: string; sourceAttemptId?: string }>;
};

// 풀이 진입 시점에 로그인을 강제한다(목록은 공개, 풀이/시도는 보호).
// refresh_token + user_info 중 하나라도 없으면 로그인으로 보낸다(access_token 은 미들웨어가
// 갱신할 수 있어 단독 기준 X). 로그인 후 원래 풀던 페이지로 정확히 복귀하도록 returnPath 에
// unitId/mode/sourceAttemptId 쿼리까지 모두 포함한다. SPA 네비게이션에서도 server component
// redirect 가 동작한다.
function buildQuizReturnPath(
  lng: string,
  slug: string,
  searchParams: { unitId?: string; mode?: string; sourceAttemptId?: string },
): string {
  const query = new URLSearchParams();
  if (searchParams.unitId) query.set('unitId', searchParams.unitId);
  if (searchParams.mode) query.set('mode', searchParams.mode);
  if (searchParams.sourceAttemptId) query.set('sourceAttemptId', searchParams.sourceAttemptId);
  const qs = query.toString();
  const base = `/${lng}/solve/${slug}/quiz`;
  return qs ? `${base}?${qs}` : base;
}

export default async function SolveQuizPage({ params, searchParams }: SolveQuizParams) {
  const { lng, slug } = await params;
  const resolvedSearchParams = await searchParams;
  const { unitId, mode, sourceAttemptId } = resolvedSearchParams;
  const language = lng as Language;

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;
  const userInfo = cookieStore.get('user_info')?.value;
  if (!refreshToken || !userInfo) {
    redirect(
      buildLoginUrl(
        `/${language}/auth/login`,
        buildQuizReturnPath(language, slug, resolvedSearchParams),
      ),
    );
  }

  // review 모드는 sourceAttemptId 가 있어야 의미 있음. 그 외는 full.
  const resolvedMode: SolveAttemptMode = mode === 'review' && sourceAttemptId ? 'review' : 'full';
  const parsedSourceId =
    resolvedMode === 'review' && sourceAttemptId ? Number(sourceAttemptId) : undefined;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-2 pb-24 pt-3 sm:px-3 md:px-4">
      <QuizClient
        lng={language}
        slug={slug}
        unitId={unitId}
        mode={resolvedMode}
        sourceAttemptId={Number.isFinite(parsedSourceId) ? parsedSourceId : undefined}
      />
    </div>
  );
}
