import StringUtils from '../stringUtils';

describe('StringUtils.toUrlSlug', () => {
  it('should convert a simple string to a URL slug', () => {
    expect(StringUtils.toUrlSlug('Hello World')).toBe('Hello-World');
  });

  it('should remove special characters', () => {
    expect(StringUtils.toUrlSlug('Hello! World?')).toBe('Hello-World');
  });

  it('should handle Korean characters', () => {
    expect(StringUtils.toUrlSlug('안녕 세상')).toBe('안녕-세상');
  });

  it('should handle numbers', () => {
    expect(StringUtils.toUrlSlug('Test 123 Go')).toBe('Test-123-Go');
  });

  it('should handle multiple spaces (current behavior: multiple hyphens)', () => {
    // 현재 로직은 여러 공백을 여러 하이픈으로 변환합니다.
    // 만약 단일 하이픈으로 변경하고 싶다면 StringUtils.toUrlSlug 로직 수정 필요
    expect(StringUtils.toUrlSlug('Hello    World')).toBe('Hello----World');
  });

  it('should handle leading/trailing spaces (current behavior: leading/trailing hyphens)', () => {
    // 현재 로직은 앞뒤 공백을 하이픈으로 변환합니다.
    // 만약 앞뒤 하이픈을 제거하고 싶다면 StringUtils.toUrlSlug 로직 수정 필요 (e.g., trim() 사용)
    expect(StringUtils.toUrlSlug('  Hello World  ')).toBe('--Hello-World--');
  });

  it('should return an empty string for an empty input', () => {
    expect(StringUtils.toUrlSlug('')).toBe('');
  });

  it('should return an empty string if only special characters are provided', () => {
    expect(StringUtils.toUrlSlug('!@#$%^&*()_+')).toBe('');
  });

  it('should handle mixed alphanumeric and special characters', () => {
    expect(StringUtils.toUrlSlug('Product v1.0 (Final)')).toBe('Product-v10-Final');
  });

  it('should handle strings with only special characters and spaces', () => {
    expect(StringUtils.toUrlSlug('!@#  $%^')).toBe('--'); // 공백은 하이픈으로
  });
});
