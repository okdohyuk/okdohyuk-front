/**
 * favoriteError: 즐겨찾기 에러 코드 해석 + toolLink 정규화 단위 테스트.
 *
 * 회귀 방지 핵심
 * - 409 는 "중복(57)" 과 "상한 초과(58)" 두 의미를 가지므로 HTTP 상태가 아니라 본문 `code` 로 분기해야 한다.
 * - toolLink 는 스펙 pattern `^/[a-z0-9\-/]+$` 를 만족해야 400 이 나지 않는다.
 */
import { describe, expect, it } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';

import {
  FAVORITE_ERROR_CODE,
  FAVORITE_MAX_COUNT,
  getFavoriteErrorCode,
  getFavoriteErrorKey,
  normalizeToolLink,
} from '../favoriteError';

/** BaseException 본문을 담은 axios 에러를 만든다. */
function axiosErrorWith(status: number, data?: unknown): AxiosError {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError('request failed', 'ERR_BAD_REQUEST', config, {}, {
    status,
    statusText: '',
    data,
    headers: {},
    config,
  } as never);
}

describe('getFavoriteErrorCode', () => {
  it('BaseException 본문의 code 를 꺼낸다', () => {
    expect(getFavoriteErrorCode(axiosErrorWith(409, { code: 57, message: '중복' }))).toBe(57);
  });

  it('axios 에러가 아니면 undefined', () => {
    expect(getFavoriteErrorCode(new Error('boom'))).toBeUndefined();
    expect(getFavoriteErrorCode(null)).toBeUndefined();
    expect(getFavoriteErrorCode('409')).toBeUndefined();
  });

  it('본문이 없거나 code 가 숫자가 아니면 undefined', () => {
    expect(getFavoriteErrorCode(axiosErrorWith(500))).toBeUndefined();
    expect(getFavoriteErrorCode(axiosErrorWith(409, { code: '57' }))).toBeUndefined();
    expect(getFavoriteErrorCode(axiosErrorWith(409, 'plain text'))).toBeUndefined();
  });
});

describe('getFavoriteErrorKey', () => {
  it.each([
    [FAVORITE_ERROR_CODE.VALIDATION, 400, 'invalidLink'],
    [FAVORITE_ERROR_CODE.DUPLICATE, 409, 'duplicate'],
    [FAVORITE_ERROR_CODE.LIMIT_EXCEEDED, 409, 'limitExceeded'],
    [FAVORITE_ERROR_CODE.ORDER_MISMATCH, 400, 'orderMismatch'],
    [FAVORITE_ERROR_CODE.NOT_EXIST, 404, 'notExist'],
    [FAVORITE_ERROR_CODE.NO_PERMISSION, 403, 'noPermission'],
  ])('code %i(HTTP %i) → %s', (code, status, expected) => {
    expect(getFavoriteErrorKey(axiosErrorWith(status, { code }))).toBe(expected);
  });

  it('같은 409 라도 57/58 을 다른 키로 구분한다', () => {
    const duplicate = getFavoriteErrorKey(axiosErrorWith(409, { code: 57 }));
    const limit = getFavoriteErrorKey(axiosErrorWith(409, { code: 58 }));
    expect(duplicate).toBe('duplicate');
    expect(limit).toBe('limitExceeded');
    expect(duplicate).not.toBe(limit);
  });

  it('code 없는 401 은 unauthorized', () => {
    expect(getFavoriteErrorKey(axiosErrorWith(401))).toBe('unauthorized');
  });

  it('알 수 없는 에러는 generic', () => {
    expect(getFavoriteErrorKey(axiosErrorWith(500))).toBe('generic');
    expect(getFavoriteErrorKey(axiosErrorWith(409, { code: 999 }))).toBe('generic');
    expect(getFavoriteErrorKey(new Error('network'))).toBe('generic');
  });
});

describe('normalizeToolLink', () => {
  it('이미 규격에 맞는 경로는 그대로 둔다', () => {
    expect(normalizeToolLink('/pokemon-type-calculator')).toBe('/pokemon-type-calculator');
    expect(normalizeToolLink('/blog/tag/next-js')).toBe('/blog/tag/next-js');
  });

  it('대문자를 소문자로 낮춘다', () => {
    expect(normalizeToolLink('/Pokemon-Type-Calculator')).toBe('/pokemon-type-calculator');
  });

  it('쿼리스트링과 해시를 제거한다', () => {
    expect(normalizeToolLink('/shortener?utm_source=home')).toBe('/shortener');
    expect(normalizeToolLink('/shortener#result')).toBe('/shortener');
    expect(normalizeToolLink('/shortener?a=1#b')).toBe('/shortener');
  });

  it('후행 슬래시를 제거한다', () => {
    expect(normalizeToolLink('/server-clock/')).toBe('/server-clock');
    expect(normalizeToolLink('/server-clock///')).toBe('/server-clock');
  });

  it('루트(/)는 도구 경로가 아니므로 null', () => {
    expect(normalizeToolLink('/')).toBeNull();
  });

  it('슬래시로 시작하지 않으면 null', () => {
    expect(normalizeToolLink('shortener')).toBeNull();
    expect(normalizeToolLink('https://okdohyuk.dev/shortener')).toBeNull();
  });

  it('pattern 에 없는 문자가 있으면 null', () => {
    expect(normalizeToolLink('/tool_name')).toBeNull();
    expect(normalizeToolLink('/도구')).toBeNull();
    expect(normalizeToolLink('/tool name')).toBeNull();
  });

  it('128자를 초과하면 null (스펙 maxLength)', () => {
    expect(normalizeToolLink(`/${'a'.repeat(127)}`)).toBe(`/${'a'.repeat(127)}`);
    expect(normalizeToolLink(`/${'a'.repeat(128)}`)).toBeNull();
  });
});

describe('상수', () => {
  it('상한은 백엔드 MAX_FAVORITE_COUNT 와 동일한 100 이다', () => {
    expect(FAVORITE_MAX_COUNT).toBe(100);
  });

  it('에러 코드 상수가 백엔드 ErrorMessage 와 일치한다', () => {
    expect(FAVORITE_ERROR_CODE).toEqual({
      // 1 = 공용 Bean Validation 실패(400). 즐겨찾기 맥락에서는 "잘못된 도구 경로"다.
      VALIDATION: 1,
      NOT_EXIST: 56,
      DUPLICATE: 57,
      LIMIT_EXCEEDED: 58,
      ORDER_MISMATCH: 59,
      NO_PERMISSION: 15,
    });
  });
});
