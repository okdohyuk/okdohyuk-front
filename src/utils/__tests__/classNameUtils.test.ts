import ClassName, { cls } from '../classNameUtils';

describe('ClassNameUtils', () => {
  describe('ClassName.cls', () => {
    it('인자가 없으면 빈 문자열을 반환해야 합니다', () => {
      expect(ClassName.cls()).toBe('');
    });

    it('하나의 인자가 있으면 해당 인자를 반환해야 합니다', () => {
      expect(ClassName.cls('foo')).toBe('foo');
    });

    it('여러 인자가 있으면 공백으로 구분된 문자열을 반환해야 합니다', () => {
      expect(ClassName.cls('foo', 'bar', 'baz')).toBe('foo bar baz');
    });

    it('인자 중 빈 문자열이 포함된 경우 올바르게 처리해야 합니다', () => {
      expect(ClassName.cls('foo', '', 'baz')).toBe('foo  baz'); // 의도적으로 공백 2칸
    });

    it('모든 인자가 빈 문자열이면 빈 문자열 사이의 공백을 반환해야 합니다', () => {
      expect(ClassName.cls('', '', '')).toBe('  '); // 의도적으로 공백 2칸
    });
  });

  describe('cls (exported function)', () => {
    it('인자가 없으면 빈 문자열을 반환해야 합니다', () => {
      expect(cls()).toBe('');
    });

    it('하나의 인자가 있으면 해당 인자를 반환해야 합니다', () => {
      expect(cls('foo')).toBe('foo');
    });

    it('여러 인자가 있으면 공백으로 구분된 문자열을 반환해야 합니다', () => {
      expect(cls('foo', 'bar', 'baz')).toBe('foo bar baz');
    });

    it('인자 중 빈 문자열이 포함된 경우 올바르게 처리해야 합니다', () => {
      expect(cls('foo', '', 'baz')).toBe('foo  baz'); // 의도적으로 공백 2칸
    });

    it('모든 인자가 빈 문자열이면 빈 문자열 사이의 공백을 반환해야 합니다', () => {
      expect(cls('', '', '')).toBe('  '); // 의도적으로 공백 2칸
    });
  });
});
