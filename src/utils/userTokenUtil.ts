import Cookies from 'js-cookie';
import { User } from '@api/User';
import Jwt from './jwtUtils'; // Jwt 유틸 임포트

// 모든 토큰/유저 정보 처리는 js-cookie를 사용하여 클라이언트에서 직접 관리합니다.
const isProduction = process.env.NODE_ENV === 'production';

export default class UserTokenUtil {
  // AccessToken 읽기
  static getAccessToken() {
    const accessToken = Cookies.get('access_token');
    return accessToken ? `Bearer ${accessToken}` : '';
  }
  // AccessToken 저장
  static setAccessToken(token: string) {
    let expiresConfig: { expires?: Date | number } = { expires: 1 }; // 기본값: 1일
    try {
      const payload = Jwt.getPayload(token);
      if (payload && payload.exp) {
        expiresConfig = { expires: new Date(payload.exp * 1000) };
      }
    } catch (e) {
      console.error('Error parsing access token payload for expiry:', e);
      // 페이로드 파싱 실패 시 기본 만료일 사용
    }
    Cookies.set('access_token', token, {
      sameSite: 'strict',
      ...expiresConfig,
      secure: isProduction,
    });
  }
  // AccessToken 삭제
  static removeAccessToken() {
    Cookies.remove('access_token');
  }
  // RefreshToken 읽기
  static getRefreshToken() {
    return Cookies.get('refresh_token') || '';
  }
  // RefreshToken 저장
  static setRefreshToken(token: string) {
    let expiresConfig: { expires?: Date | number } = { expires: 7 }; // 기본값: 7일
    try {
      const payload = Jwt.getPayload(token);
      if (payload && payload.exp) {
        expiresConfig = { expires: new Date(payload.exp * 1000) };
      }
    } catch (e) {
      console.error('Error parsing refresh token payload for expiry:', e);
      // 페이로드 파싱 실패 시 기본 만료일 사용
    }
    Cookies.set('refresh_token', token, {
      sameSite: 'strict',
      ...expiresConfig,
      secure: isProduction,
    });
  }
  // RefreshToken 삭제
  static removeRefreshToken() {
    Cookies.remove('refresh_token');
  }
  // 사용자 정보 읽기
  static getUserInfo() {
    const userInfoString = Cookies.get('user_info');
    if (userInfoString) {
      try {
        return JSON.parse(userInfoString) as User;
      } catch (e) {
        console.error('user_info 쿠키 파싱 오류:', e);
        Cookies.remove('user_info');
        return null;
      }
    }
    return null;
  }
  // 사용자 정보 저장
  static setUserInfo(userInfo: object) {
    Cookies.set('user_info', JSON.stringify(userInfo), {
      sameSite: 'strict',
      expires: 7,
      secure: isProduction,
    });
  }
  // 사용자 정보 삭제
  static removeUserInfo() {
    Cookies.remove('user_info');
  }
  // Bearer 토큰 문자열 반환
  static getTokenBearer(token: string) {
    return `Bearer ${token}`;
  }
}
