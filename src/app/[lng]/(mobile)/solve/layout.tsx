import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { ChildrenProps } from '~/app/[lng]/layout';

export const dynamic = 'force-dynamic';

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'solve' });

// solve 목록(과목·단원)은 비회원도 열람 가능하다(백엔드 GET /solve/subjects, /solve/subjects/{slug}
// 가 공개). 인증 가드는 layout 에서 제거하고, 로그인 필요한 진입점(풀이 quiz, 기록 me)에만
// 개별 가드를 둔다. 실제 데이터 보호는 백엔드 @User 가 담당한다.
export default async function SolveLayout({ children }: ChildrenProps) {
  // 가드 없이 하위 트리를 그대로 렌더. (mobile) 레이아웃이 상위에서 크롬을 제공한다.
  return children;
}
