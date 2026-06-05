import Cookies from 'js-cookie';

/**
 * 로그인 후 복귀 경로(redirect_uri) 기록/조회 공통 헬퍼.
 *
 * 로그인 페이지는 OAuth 왕복(구글 → /auth/login#...) 과정에서 쿼리 파라미터가 유실되므로
 * 복귀 경로를 쿠키에 보관한다. 로그인으로 보내는 모든 진입점은 이 헬퍼로 경로를 기록해야
 * 로그인 완료 후 이전 페이지로 복귀할 수 있다.
 */
const REDIRECT_URI_COOKIE = 'redirect_uri';

/**
 * 내부 경로만 허용해 open redirect를 방지한다.
 * - 절대 경로(`/...`)만 허용, 프로토콜 상대 URL(`//host`) 차단
 * - 로그인 페이지 자신으로의 복귀는 무의미하므로 제외
 */
export function sanitizeRedirectUri(uri: string | undefined | null): string | null {
  if (!uri) return null;
  if (!uri.startsWith('/') || uri.startsWith('//')) return null;
  if (uri.includes('/auth/login')) return null;
  return uri;
}

/** 로그인 후 복귀할 경로를 쿠키에 기록한다. 유효하지 않은 경로면 무시. */
export function rememberLoginRedirect(path: string | undefined | null): void {
  const sanitized = sanitizeRedirectUri(path);
  if (sanitized) Cookies.set(REDIRECT_URI_COOKIE, sanitized);
}

/** 기록된 복귀 경로를 읽는다. 없거나 유효하지 않으면 null. */
export function getLoginRedirect(): string | null {
  return sanitizeRedirectUri(Cookies.get(REDIRECT_URI_COOKIE));
}

/** 기록된 복귀 경로를 제거한다. */
export function clearLoginRedirect(): void {
  Cookies.remove(REDIRECT_URI_COOKIE);
}

/** 복귀 경로를 쿼리로 담은 로그인 페이지 URL을 만든다. (서버 컴포넌트/링크용) */
export function buildLoginUrl(loginPath: string, redirectUri: string): string {
  return `${loginPath}?redirect_uri=${encodeURIComponent(redirectUri)}`;
}
