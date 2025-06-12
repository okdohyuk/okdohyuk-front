import Jwt from '../jwtUtils';

describe('JwtUtils', () => {
  describe('getPayload', () => {
    it('유효한 JWT 토큰에서 페이로드를 올바르게 추출해야 합니다', () => {
      const mockPayload = { userId: 123, username: 'testuser', exp: 1678886400 };
      // header.payload.signature 형식의 간단한 모의 JWT
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
      const payload = Buffer.from(JSON.stringify(mockPayload)).toString('base64');
      const signature = 'mockSignature';
      const token = `${header}.${payload}.${signature}`;

      expect(Jwt.getPayload(token)).toEqual(mockPayload);
    });

    it('페이로드에 다양한 데이터 타입이 포함된 경우 올바르게 처리해야 합니다', () => {
      const mockPayload = {
        string: 'text',
        number: 123,
        boolean: true,
        array: [1, 'two', false],
        object: { nestedKey: 'nestedValue' },
      };
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
      const payload = Buffer.from(JSON.stringify(mockPayload)).toString('base64');
      const signature = 'mockSignature';
      const token = `${header}.${payload}.${signature}`;

      expect(Jwt.getPayload(token)).toEqual(mockPayload);
    });

    it('JWT 토큰 형식이 잘못된 경우 에러를 발생시켜야 합니다 (점이 없는 경우)', () => {
      const invalidToken = 'invalidtokenwithoutdots';
      expect(() => Jwt.getPayload(invalidToken)).toThrow();
    });

    it('JWT 토큰 형식이 잘못된 경우 에러를 발생시켜야 합니다 (페이로드가 base64가 아닌 경우)', () => {
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
      const invalidPayload = 'this-is-not-base64';
      const signature = 'mockSignature';
      const token = `${header}.${invalidPayload}.${signature}`;
      // Buffer.from with invalid base64 might not throw immediately but result in garbled JSON.parse input
      expect(() => Jwt.getPayload(token)).toThrow(SyntaxError); // JSON.parse should fail
    });

    it('JWT 토큰 페이로드가 유효한 JSON이 아닌 경우 에러를 발생시켜야 합니다', () => {
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
      const nonJsonPayload = Buffer.from('this is not json').toString('base64');
      const signature = 'mockSignature';
      const token = `${header}.${nonJsonPayload}.${signature}`;
      expect(() => Jwt.getPayload(token)).toThrow(SyntaxError);
    });
  });
});
