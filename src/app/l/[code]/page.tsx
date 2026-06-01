import { notFound, redirect } from 'next/navigation';
import { AxiosError } from 'axios';
import { shortUrlApi } from '@api';
import logger from '@utils/logger';

// 외부에 공유되는 짧은 링크는 항상 최신 매핑을 따라야 하므로 동적 렌더링 강제.
export const dynamic = 'force-dynamic';

interface ShortLinkPageProps {
  params: Promise<{ code: string }>;
}

export default async function ShortLinkPage({ params }: ShortLinkPageProps) {
  const { code } = await params;

  // resolve 호출만 try/catch 로 감싸 redirect() 가 던지는 NEXT_REDIRECT 시그널을 잡지 않도록 한다.
  let originalUrl: string | null = null;
  try {
    const { data } = await shortUrlApi.getShortUrlResolve(code);
    originalUrl = data.originalUrl;
  } catch (err) {
    if (err instanceof AxiosError) {
      logger.warn('ShortLinkPage resolve 실패', code, err.response?.status);
    } else {
      logger.error('ShortLinkPage resolve unexpected error', err);
    }
  }

  if (!originalUrl) {
    // 404(미존재) / 410(만료) / 네트워크 오류 모두 not-found 페이지로 안내.
    notFound();
  }

  // Location 헤더에는 ASCII(latin1)만 허용된다. 원본 URL에 한글 등 비ASCII나
  // 인코딩되지 않은 공백이 포함되면 redirect() 내부의 setHeader 가
  // "Invalid character in header content" 로 throw → try/catch 밖이라 500 이 된다.
  // new URL().href 로 path/query/host(punycode)를 정규화·percent-encoding 하여 헤더 안전 문자열로 만든다.
  let redirectUrl: string;
  try {
    redirectUrl = new URL(originalUrl).href;
  } catch {
    // 정규화 불가한 비정상 URL 은 not-found 로 안내한다.
    logger.warn('ShortLinkPage 잘못된 originalUrl', code, originalUrl);
    notFound();
  }

  redirect(redirectUrl);
}
