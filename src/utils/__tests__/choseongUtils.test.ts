import { toChoseong } from '@utils/choseongUtils';

describe('toChoseong', () => {
  it('extracts initial consonants from Korean text', () => {
    expect(toChoseong('안녕하세요')).toBe('ㅇㄴㅎㅅㅇ');
  });

  it('keeps non-Korean characters', () => {
    expect(toChoseong('Hello 세계')).toBe('Hello ㅅㄱ');
  });
});
