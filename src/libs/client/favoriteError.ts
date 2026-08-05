import { isAxiosError } from 'axios';

/*
 * 즐겨찾기 API 의 에러 코드 해석.
 *
 * 백엔드는 HTTP 상태만으로 원인을 구분할 수 없는 응답을 낸다.
 * 특히 POST /favorite 의 409 는 "중복(57)" 과 "상한 초과(58)" 두 가지 의미를 갖는다.
 * 따라서 BaseException 본문의 `code` 로 분기해야 한다(필드명은 errorCode 가 아니라 code).
 *
 * 대응표 (백엔드 enums/ErrorMessage)
 * - 57 FAVORITE_DUPLICATE_EXCEPTION       409  이미 등록된 toolLink
 * - 58 FAVORITE_LIMIT_EXCEEDED_EXCEPTION  409  즐겨찾기 상한(100) 초과
 * - 59 FAVORITE_ORDER_MISMATCH_EXCEPTION  400  순서 변경 요청 집합이 보유 집합과 불일치
 * - 15 NO_PERMISSION_EXCEPTION            403  보유 목록에 없는 id (타인 소유/미존재 구분 없음)
 * - 56 FAVORITE_NOT_EXIST_EXCEPTION       404  DELETE 대상 미존재
 */

export const FAVORITE_ERROR_CODE = {
  /**
   * 1 = 공용 Bean Validation 실패(400).
   * `toolLink` 가 스펙 pattern/길이 제약을 어겼을 때 나므로 즐겨찾기 맥락에서는 "잘못된 도구 경로"다.
   * 프론트가 `normalizeToolLink` 로 먼저 거르지만, 메뉴 데이터가 스펙과 어긋나면 여기로 떨어진다.
   */
  VALIDATION: 1,
  NOT_EXIST: 56,
  DUPLICATE: 57,
  LIMIT_EXCEEDED: 58,
  ORDER_MISMATCH: 59,
  NO_PERMISSION: 15,
} as const;

/** 즐겨찾기 상한. 스펙 FavoriteReorderRequest.maxItems / 백엔드 MAX_FAVORITE_COUNT 와 함께 조정한다. */
export const FAVORITE_MAX_COUNT = 100;

/** axios 에러 본문에서 BaseException.code 를 안전하게 꺼낸다. */
export const getFavoriteErrorCode = (error: unknown): number | undefined => {
  if (!isAxiosError(error)) return undefined;
  const body: unknown = error.response?.data;
  if (typeof body !== 'object' || body === null || !('code' in body)) return undefined;
  const { code } = body as { code?: unknown };
  return typeof code === 'number' ? code : undefined;
};

/** 즐겨찾기 에러를 i18n 키 접미사로 환산한다(`favorites` 네임스페이스의 `error.*`). */
export type FavoriteErrorKey =
  | 'duplicate'
  | 'limitExceeded'
  | 'orderMismatch'
  | 'notExist'
  | 'noPermission'
  | 'unauthorized'
  | 'invalidLink'
  | 'generic';

export const getFavoriteErrorKey = (error: unknown): FavoriteErrorKey => {
  switch (getFavoriteErrorCode(error)) {
    case FAVORITE_ERROR_CODE.VALIDATION:
      return 'invalidLink';
    case FAVORITE_ERROR_CODE.DUPLICATE:
      return 'duplicate';
    case FAVORITE_ERROR_CODE.LIMIT_EXCEEDED:
      return 'limitExceeded';
    case FAVORITE_ERROR_CODE.ORDER_MISMATCH:
      return 'orderMismatch';
    case FAVORITE_ERROR_CODE.NOT_EXIST:
      return 'notExist';
    case FAVORITE_ERROR_CODE.NO_PERMISSION:
      return 'noPermission';
    default:
      // 토큰 오류 401 은 axios 인터셉터가 리프레시/로그아웃으로 흡수하므로
      // 여기까지 온 401 은 "로그인이 필요하다" 안내로 충분하다.
      return isAxiosError(error) && error.response?.status === 401 ? 'unauthorized' : 'generic';
  }
};

/**
 * `toolLink` 정규화.
 * 스펙 pattern 은 `^/[a-z0-9\-/]+$` 라 대문자·쿼리스트링·해시가 있으면 400 이 난다.
 * 등록 전 반드시 이 함수를 거쳐 서버가 받을 수 있는 형태로 만든다.
 */
export const normalizeToolLink = (link: string): string | null => {
  const withoutQuery = link.split(/[?#]/)[0].toLowerCase();
  const trimmed = withoutQuery.length > 1 ? withoutQuery.replace(/\/+$/, '') : withoutQuery;
  return /^\/[a-z0-9\-/]+$/.test(trimmed) && trimmed.length <= 128 ? trimmed : null;
};
