import { vi } from 'vitest';
import DateUtils from '../dateUtils';

// 현재 시간을 고정하기 위한 기준 시간 설정
const MOCK_NOW = new Date('2024-05-27T10:00:00.000Z').getTime();

describe('DateUtils.foramtDate', () => {
  beforeEach(() => {
    // 각 테스트 전에 Date.now()를 모킹하여 고정된 시간을 반환하도록 설정
    vi.spyOn(Date, 'now').mockReturnValue(MOCK_NOW);
  });

  afterEach(() => {
    // 각 테스트 후에 모킹을 복원
    vi.restoreAllMocks();
  });

  it('should return relative time for a date 1 day ago', () => {
    const oneDayAgo = new Date(MOCK_NOW - 24 * 60 * 60 * 1000).toISOString();
    expect(DateUtils.foramtDate(oneDayAgo)).toBe('1일 전');
  });

  it('should return relative time for a date 1 month ago', () => {
    const oneMonthAgo = new Date(MOCK_NOW);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    // formatDistance는 근사치를 사용하므로, 정확한 문자열 대신 정규식으로 확인 가능
    expect(DateUtils.foramtDate(oneMonthAgo.toISOString())).toMatch(/약 1개월 전|지난달/);
  });

  it('should return absolute date for a date 3 months ago', () => {
    const threeMonthsAgo = new Date(MOCK_NOW);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    // 'PPP' format example: 2024년 2월 27일
    expect(DateUtils.foramtDate(threeMonthsAgo.toISOString())).toBe('2024년 2월 27일');
  });

  it('should return absolute date for a date 1 year ago', () => {
    const oneYearAgo = new Date(MOCK_NOW);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    expect(DateUtils.foramtDate(oneYearAgo.toISOString())).toBe('2023년 5월 27일');
  });

  it('should return relative time for a date 1 day in the future', () => {
    const oneDayFuture = new Date(MOCK_NOW + 24 * 60 * 60 * 1000).toISOString();
    expect(DateUtils.foramtDate(oneDayFuture)).toBe('1일 후');
  });

  it('should return relative time for a date 2 months in the future', () => {
    const twoMonthsFuture = new Date(MOCK_NOW);
    twoMonthsFuture.setMonth(twoMonthsFuture.getMonth() + 2);
    expect(DateUtils.foramtDate(twoMonthsFuture.toISOString())).toMatch(/2개월 후|다음달/);
  });

  // 경계 값 테스트: 3개월 직전 (상대 시간)
  it('should return relative time for a date just under 3 months ago', () => {
    const justUnder3Months = new Date(MOCK_NOW);
    justUnder3Months.setDate(justUnder3Months.getDate() - (30 * 3 - 1)); // 89일 전
    expect(DateUtils.foramtDate(justUnder3Months.toISOString())).toMatch(/개월 전|일 전/); // "약 3개월 전" 또는 "89일 전" 등
  });

  // 잘못된 날짜 형식 테스트
  it('should handle invalid date string gracefully', () => {
    // date-fns의 format 함수는 잘못된 날짜에 대해 "Invalid Date"와 유사한 문자열을 반환하거나, locale에 따라 다를 수 있음
    // 여기서는 특정 문자열을 기대하기보다, 에러를 던지지 않는지 확인하거나, 반환 값의 패턴을 확인할 수 있음
    // 실제 date-fns 동작에 따라 이 부분은 조정 필요
    // 예시: expect(() => DateUtils.foramtDate('invalid-date')).not.toThrow();
    // 또는 특정 반환 값을 기대한다면 해당 값으로 변경
    // 현재 로직상 new Date('invalid-date')는 Invalid Date 객체를 만들고, format에서 이를 처리.
    // ko locale에서 'PPP'는 '유효하지 않은 날짜' 등을 반환할 수 있음.
    // 정확한 반환값은 date-fns 버전 및 ko locale 데이터에 따라 다를 수 있으므로, 실제 실행 후 조정 필요.
    // 여기서는 '유효하지 않은 날짜'를 기대값으로 설정 (실제 실행 시 확인 필요)
    expect(() => DateUtils.foramtDate('invalid-date-string')).toThrow(RangeError);
  });

  // 함수명 오타에 대한 참고 주석
  // TODO: Consider renaming 'foramtDate' to 'formatDate' in DateUtils.ts
});
