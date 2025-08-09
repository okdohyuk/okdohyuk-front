import CoderUtils from '../index';
import { CoderFormType, CoderType } from '../type';

describe('CoderUtils', () => {
  describe('runCoder', () => {
    // BASE64 인코딩 테스트
    describe('BASE64 Encoding', () => {
      const type: CoderType = 'BASE64';
      const isEncoder = true;

      it('단일 BASE64 인코딩을 수행해야 합니다', () => {
        const params: CoderFormType = { type, isEncoder, count: 1, value: 'hello' };
        expect(CoderUtils.runCoder(params)).toEqual(['aGVsbG8=']);
      });

      it('다중 BASE64 인코딩을 수행해야 합니다', () => {
        const params: CoderFormType = { type, isEncoder, count: 2, value: 'hello' };
        // btoa(btoa('hello')) = btoa('aGVsbG8=') = 'YUdWc2JHOD0='
        expect(CoderUtils.runCoder(params)).toEqual(['aGVsbG8=', 'YUdWc2JHOD0=']);
      });

      it('빈 문자열에 대한 BASE64 인코딩을 처리해야 합니다', () => {
        const params: CoderFormType = { type, isEncoder, count: 1, value: '' };
        expect(CoderUtils.runCoder(params)).toEqual(['']);
      });
    });

    // BASE64 디코딩 테스트
    describe('BASE64 Decoding', () => {
      const type: CoderType = 'BASE64';
      const isEncoder = false;

      it('단일 BASE64 디코딩을 수행해야 합니다', () => {
        const params: CoderFormType = { type, isEncoder, count: 1, value: 'aGVsbG8=' };
        expect(CoderUtils.runCoder(params)).toEqual(['hello']);
      });

      it('다중 BASE64 디코딩을 수행해야 합니다', () => {
        const params: CoderFormType = { type, isEncoder, count: 2, value: 'YUdWc2JHOD0=' };
        // atob(atob('YUdWc2JHOD0=')) = atob('aGVsbG8=') = 'hello'
        expect(CoderUtils.runCoder(params)).toEqual(['aGVsbG8=', 'hello']);
      });

      it('빈 문자열에 대한 BASE64 디코딩을 처리해야 합니다', () => {
        const params: CoderFormType = { type, isEncoder, count: 1, value: '' };
        expect(CoderUtils.runCoder(params)).toEqual(['']);
      });

      it('잘못된 BASE64 문자열 디코딩 시 에러를 발생시켜야 합니다', () => {
        const params: CoderFormType = { type, isEncoder, count: 1, value: 'invalid-base64!' };
        // In Node.js, atob throws a DOMException for invalid base64 strings.
        // In some browser environments, it might throw a different error or return null.
        // For Jest running in Node, we expect a DOMException.
        // If running in a pure browser Jest setup, this might need adjustment.
        expect(() => CoderUtils.runCoder(params)).toThrow();
      });
    });

    // URI 인코딩 테스트
    describe('URI Encoding', () => {
      const type: CoderType = 'URI';
      const isEncoder = true;

      it('단일 URI 인코딩을 수행해야 합니다', () => {
        const params: CoderFormType = { type, isEncoder, count: 1, value: 'hello world' };
        expect(CoderUtils.runCoder(params)).toEqual(['hello%20world']);
      });

      it('다중 URI 인코딩을 수행해야 합니다', () => {
        const params: CoderFormType = { type, isEncoder, count: 2, value: 'hello world' };
        // encodeURI(encodeURI('hello world')) = encodeURI('hello%20world') = 'hello%2520world'
        expect(CoderUtils.runCoder(params)).toEqual(['hello%20world', 'hello%2520world']);
      });

      it('빈 문자열에 대한 URI 인코딩을 처리해야 합니다', () => {
        const params: CoderFormType = { type, isEncoder, count: 1, value: '' };
        expect(CoderUtils.runCoder(params)).toEqual(['']);
      });
    });

    // URI 디코딩 테스트
    describe('URI Decoding', () => {
      const type: CoderType = 'URI';
      const isEncoder = false;

      it('단일 URI 디코딩을 수행해야 합니다', () => {
        const params: CoderFormType = { type, isEncoder, count: 1, value: 'hello%20world' };
        expect(CoderUtils.runCoder(params)).toEqual(['hello world']);
      });

      it('다중 URI 디코딩을 수행해야 합니다', () => {
        const params: CoderFormType = { type, isEncoder, count: 2, value: 'hello%2520world' };
        // decodeURI(decodeURI('hello%2520world')) = decodeURI('hello%20world') = 'hello world'
        expect(CoderUtils.runCoder(params)).toEqual(['hello%20world', 'hello world']);
      });

      it('빈 문자열에 대한 URI 디코딩을 처리해야 합니다', () => {
        const params: CoderFormType = { type, isEncoder, count: 1, value: '' };
        expect(CoderUtils.runCoder(params)).toEqual(['']);
      });

      it('잘못된 URI 문자열 디코딩 시 URIError를 발생시켜야 합니다', () => {
        const params: CoderFormType = { type, isEncoder, count: 1, value: '%' };
        expect(() => CoderUtils.runCoder(params)).toThrow(URIError);
      });
    });

    // 추가 인코딩/디코딩 방식 테스트
    describe('URI_COMPONENT', () => {
      const type: CoderType = 'URI_COMPONENT';
      it('should encode URI component', () => {
        const params: CoderFormType = { type, isEncoder: true, count: 1, value: 'a b' };
        expect(CoderUtils.runCoder(params)).toEqual(['a%20b']);
      });
      it('should decode URI component', () => {
        const params: CoderFormType = { type, isEncoder: false, count: 1, value: 'a%20b' };
        expect(CoderUtils.runCoder(params)).toEqual(['a b']);
      });
    });

    describe('ESCAPE', () => {
      const type: CoderType = 'ESCAPE';
      it('should encode using escape', () => {
        const params: CoderFormType = { type, isEncoder: true, count: 1, value: 'abc=한' };
        expect(CoderUtils.runCoder(params)).toEqual(['abc%3D%uD55C']);
      });
      it('should decode using unescape', () => {
        const params: CoderFormType = { type, isEncoder: false, count: 1, value: 'abc%3D%uD55C' };
        expect(CoderUtils.runCoder(params)).toEqual(['abc=한']);
      });
    });

    describe('HEX', () => {
      const type: CoderType = 'HEX';
      it('should encode to hex', () => {
        const params: CoderFormType = { type, isEncoder: true, count: 1, value: 'hi' };
        expect(CoderUtils.runCoder(params)).toEqual(['6869']);
      });
      it('should decode from hex', () => {
        const params: CoderFormType = { type, isEncoder: false, count: 1, value: '6869' };
        expect(CoderUtils.runCoder(params)).toEqual(['hi']);
      });
    });

    describe('BINARY', () => {
      const type: CoderType = 'BINARY';
      it('should encode to binary', () => {
        const params: CoderFormType = { type, isEncoder: true, count: 1, value: 'A' };
        expect(CoderUtils.runCoder(params)).toEqual(['01000001']);
      });
      it('should decode from binary', () => {
        const params: CoderFormType = { type, isEncoder: false, count: 1, value: '01000001' };
        expect(CoderUtils.runCoder(params)).toEqual(['A']);
      });
    });

    describe('HTML', () => {
      const type: CoderType = 'HTML';
      it('should encode HTML entities', () => {
        const params: CoderFormType = { type, isEncoder: true, count: 1, value: '<div>' };
        expect(CoderUtils.runCoder(params)).toEqual(['&lt;div&gt;']);
      });
      it('should decode HTML entities', () => {
        const params: CoderFormType = { type, isEncoder: false, count: 1, value: '&lt;div&gt;' };
        expect(CoderUtils.runCoder(params)).toEqual(['<div>']);
      });
    });

    // 기타 엣지 케이스
    describe('Edge Cases', () => {
      it('count가 0이면 빈 배열을 반환해야 합니다', () => {
        const params: CoderFormType = { type: 'BASE64', isEncoder: true, count: 0, value: 'test' };
        expect(CoderUtils.runCoder(params)).toEqual([]);
      });

      it('지원하지 않는 타입에 대해 에러를 발생시켜야 합니다', () => {
        // CoderType에 없는 타입을 강제로 할당하여 테스트
        expect(() =>
          CoderUtils.runCoder({
            type: 'UNSUPPORTED_TYPE' as CoderType,
            isEncoder: true,
            count: 1,
            value: 'test',
          }),
        ).toThrow('지원하지 않는 타입입니다: UNSUPPORTED_TYPE');
      });
    });
  });
});
