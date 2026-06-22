'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ListChecks } from 'lucide-react';
import Skeleton from '@components/basic/Skeleton';
import GoogleAd from '@components/google/GoogleAd';
import { useSubjects, useSolveProgress } from '@queries/useSolveQueries';
import UserTokenUtil from '@utils/userTokenUtil';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { SubjectCard } from './components';

type SolveSubjectsClientProps = {
  lng: Language;
};

export default function SolveSubjectsClient({ lng }: SolveSubjectsClientProps) {
  const { t } = useTranslation(lng, 'solve');
  const router = useRouter();

  // 진행률(/solve/progress)은 로그인 필수다. 비회원이 호출하면 401 → axios 응답 인터셉터가
  // refresh 시도 실패 → logoutAndLogin 으로 로그인 리다이렉트되어 "목록 열람"이 깨진다.
  // 따라서 로그인 시에만 useSolveProgress 를 활성화한다. SSR/하이드레이션 단계엔 쿠키를 읽지
  // 않아 항상 false → enabled=false(idle). 마운트 후 user_info 쿠키로 판정한다.
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  React.useEffect(() => {
    setIsLoggedIn(!!UserTokenUtil.getUserInfo());
  }, []);

  const { data: subjects, isLoading, isError } = useSubjects();
  const { data: progress } = useSolveProgress(isLoggedIn);

  // subjectSlug → 진행률(서버 derived). 없으면 0 으로 표시.
  const progressBySlug = React.useMemo(() => {
    const map = new Map<string, { answered: number; correct: number; total: number }>();
    (progress ?? []).forEach((p) => {
      map.set(p.subjectSlug, { answered: p.answered, correct: p.correct, total: p.total });
    });
    return map;
  }, [progress]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-2xl border border-basic-3 bg-basic-0 p-4 text-sm text-danger-1">
        {t('subjects.error')}
      </p>
    );
  }

  const items = subjects ?? [];

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-basic-3 bg-basic-0 p-4 text-sm text-fg-4">
        {t('subjects.empty')}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((subject) => {
          const prog = progressBySlug.get(subject.slug);
          const answered = prog?.answered ?? 0;
          const completed = subject.totalQuestions > 0 && answered >= subject.totalQuestions;
          return (
            <SubjectCard
              key={subject.slug}
              title={subject.title}
              totalQuestions={subject.totalQuestions}
              unitCount={subject.units.length}
              answeredCount={answered}
              completed={completed}
              color={subject.color}
              onOpen={() => router.push(`/${lng}/solve/${subject.slug}`)}
            />
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.push(`/${lng}/solve/me`)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-fg-4 hover:text-point-fg"
        >
          <ListChecks className="h-4 w-4" />
          {t('subjects.myAttempts')}
        </button>
      </div>

      {/* in-content 광고: 과목 그리드 아래. 보기/입력과 인접하지 않아 정책상 안전. */}
      <GoogleAd className="mt-2 w-full min-h-16" slotId="6290029027" />
    </div>
  );
}
