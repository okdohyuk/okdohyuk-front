'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { sessionApi } from '@api';
import logger from '@utils/logger';

const SESSION_COOKIE_NAME = 'SessionId';
const SESSION_EXPIRES_AT_COOKIE = 'SessionExpiresAt';
const isProduction = process.env.NODE_ENV === 'production';

interface UseSessionResult {
  sessionId: string | null;
  isLoading: boolean;
  /** 백엔드에 세션 발급/검증 요청. 만료되었거나 없으면 새로 발급한다. */
  refresh: () => Promise<string | null>;
}

function readStoredExpiresAt(): Date | null {
  const raw = Cookies.get(SESSION_EXPIRES_AT_COOKIE);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function persistSession(sessionId: string, expiresAt: string) {
  const expires = new Date(expiresAt);
  const cookieOptions: Cookies.CookieAttributes = {
    path: '/',
    sameSite: 'strict',
    secure: isProduction,
    expires: Number.isNaN(expires.getTime()) ? 365 : expires,
  };
  Cookies.set(SESSION_COOKIE_NAME, sessionId, cookieOptions);
  Cookies.set(SESSION_EXPIRES_AT_COOKIE, expiresAt, cookieOptions);
}

export function clearSessionCookies() {
  Cookies.remove(SESSION_COOKIE_NAME, { path: '/' });
  Cookies.remove(SESSION_EXPIRES_AT_COOKIE, { path: '/' });
}

/**
 * 익명 세션을 백엔드로부터 발급/갱신하고 쿠키에 보관한다.
 *
 * - 마운트 시 쿠키에 유효한 세션이 있으면 그대로 사용.
 * - 만료가 임박했거나(=expires_at 이전 1일) 없으면 `POST /session` 호출.
 * - 응답으로 받은 session_id / expires_at을 쿠키에 저장.
 *
 * 쿠키는 middleware에서 fetch로 1차 발급되며, 여기서는 검증/갱신을 담당한다.
 */
export function useSession(): UseSessionResult {
  const [sessionId, setSessionId] = useState<string | null>(
    () => Cookies.get(SESSION_COOKIE_NAME) ?? null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inFlightRef = useRef<Promise<string | null> | null>(null);

  const refresh = useCallback(async (): Promise<string | null> => {
    if (inFlightRef.current) return inFlightRef.current;

    const existing = Cookies.get(SESSION_COOKIE_NAME);

    const request = (async () => {
      setIsLoading(true);
      try {
        const { data } = await sessionApi.postSession(existing);
        persistSession(data.session_id, data.expires_at);
        setSessionId(data.session_id);
        return data.session_id;
      } catch (err) {
        logger.error('useSession: 세션 발급 실패', err);
        return existing ?? null;
      } finally {
        setIsLoading(false);
        inFlightRef.current = null;
      }
    })();

    inFlightRef.current = request;
    return request;
  }, []);

  useEffect(() => {
    const cookieSessionId = Cookies.get(SESSION_COOKIE_NAME);
    const expiresAt = readStoredExpiresAt();

    // 만료 1일 전이면 갱신 (= 만료 임박)
    const oneDayMs = 24 * 60 * 60 * 1000;
    const shouldRefresh =
      !cookieSessionId || !expiresAt || expiresAt.getTime() - Date.now() < oneDayMs;

    if (shouldRefresh) {
      refresh().catch(() => undefined);
    } else if (cookieSessionId && cookieSessionId !== sessionId) {
      setSessionId(cookieSessionId);
    }
    // 마운트 시 1회만 실행. refresh는 안정적 콜백.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { sessionId, isLoading, refresh };
}

export default useSession;
